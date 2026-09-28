package org.acutemedicaltake.app;

import androidx.annotation.NonNull;
import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryProductDetailsResult;
import com.android.billingclient.api.QueryPurchasesParams;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "AMTBilling")
public class AMTBillingPlugin extends Plugin implements PurchasesUpdatedListener {
    public static final String PRODUCT_ID = "amt_pro_lifetime";
    private static final String PREFS = "amt_billing";
    private static final String ENTITLED = "pro_entitled";

    private BillingClient billingClient;
    private ProductDetails productDetails;
    private PluginCall activePurchaseCall;

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
            )
            .enableAutoServiceReconnection()
            .build();
        connect(null, null);
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        connect(() -> queryStatus(call, false), call);
    }

    @PluginMethod
    public void restore(PluginCall call) {
        connect(() -> queryStatus(call, true), call);
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        connect(() -> queryProductAndLaunch(call), call);
    }

    private void connect(Runnable onReady, PluginCall call) {
        if (billingClient != null && billingClient.isReady()) {
            if (onReady != null) onReady.run();
            return;
        }
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    if (onReady != null) onReady.run();
                } else if (call != null) {
                    call.reject("Google Play Billing is unavailable: " + result.getDebugMessage(), "BILLING_UNAVAILABLE");
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // PBL 9 automatic reconnection handles the next billing operation.
            }
        });
    }

    private QueryProductDetailsParams productQuery() {
        QueryProductDetailsParams.Product product = QueryProductDetailsParams.Product.newBuilder()
            .setProductId(PRODUCT_ID)
            .setProductType(BillingClient.ProductType.INAPP)
            .build();
        return QueryProductDetailsParams.newBuilder()
            .setProductList(Collections.singletonList(product))
            .build();
    }

    private void queryProductAndLaunch(PluginCall call) {
        billingClient.queryProductDetailsAsync(productQuery(), (result, detailsResult) -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || detailsResult.getProductDetailsList().isEmpty()) {
                call.reject("AMT Pro is not available from Google Play yet.", "PRODUCT_UNAVAILABLE");
                return;
            }

            productDetails = detailsResult.getProductDetailsList().get(0);
            BillingFlowParams.ProductDetailsParams.Builder item = BillingFlowParams.ProductDetailsParams.newBuilder()
                .setProductDetails(productDetails);
            List<ProductDetails.OneTimePurchaseOfferDetails> offers = productDetails.getOneTimePurchaseOfferDetailsList();
            if (offers != null && !offers.isEmpty()) {
                item.setOfferToken(offers.get(0).getOfferToken());
            }
            BillingFlowParams flow = BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(Collections.singletonList(item.build()))
                .setIsOfferPersonalized(false)
                .build();
            activePurchaseCall = call;
            BillingResult launch = billingClient.launchBillingFlow(getActivity(), flow);
            if (launch.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                activePurchaseCall = null;
                call.reject("Unable to open Google Play purchase: " + launch.getDebugMessage(), "PURCHASE_LAUNCH_FAILED");
            }
        });
    }

    private void queryStatus(PluginCall call, boolean restoring) {
        QueryPurchasesParams params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP)
            .build();
        billingClient.queryPurchasesAsync(params, (result, purchases) -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                JSObject cached = statusObject(readEntitlement(), false, null, false);
                cached.put("offline", true);
                call.resolve(cached);
                return;
            }

            Purchase owned = findOwnedPurchase(purchases);
            boolean entitled = owned != null && owned.getPurchaseState() == Purchase.PurchaseState.PURCHASED;
            boolean pending = owned != null && owned.getPurchaseState() == Purchase.PurchaseState.PENDING;
            saveEntitlement(entitled);
            if (entitled && !owned.isAcknowledged()) acknowledge(owned);
            queryPrice(call, entitled, pending, restoring);
        });
    }

    private void queryPrice(PluginCall call, boolean entitled, boolean pending, boolean restored) {
        billingClient.queryProductDetailsAsync(productQuery(), (result, detailsResult) -> {
            String price = null;
            boolean available = false;
            if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && !detailsResult.getProductDetailsList().isEmpty()) {
                productDetails = detailsResult.getProductDetailsList().get(0);
                List<ProductDetails.OneTimePurchaseOfferDetails> offers = productDetails.getOneTimePurchaseOfferDetailsList();
                if (offers != null && !offers.isEmpty()) {
                    price = offers.get(0).getFormattedPrice();
                    available = true;
                }
            }
            JSObject status = statusObject(entitled, pending, price, available);
            status.put("restored", restored && entitled);
            call.resolve(status);
        });
    }

    private Purchase findOwnedPurchase(List<Purchase> purchases) {
        if (purchases == null) return null;
        for (Purchase purchase : purchases) {
            if (purchase.getProducts().contains(PRODUCT_ID)) return purchase;
        }
        return null;
    }

    private void processPurchase(Purchase purchase) {
        if (!purchase.getProducts().contains(PRODUCT_ID)) return;
        boolean entitled = purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED;
        boolean pending = purchase.getPurchaseState() == Purchase.PurchaseState.PENDING;
        if (entitled) {
            saveEntitlement(true);
            if (!purchase.isAcknowledged()) acknowledge(purchase);
        }
        JSObject status = statusObject(entitled, pending, formattedPrice(), true);
        notifyListeners("purchaseChanged", status, true);
        if (activePurchaseCall != null) {
            activePurchaseCall.resolve(status);
            activePurchaseCall = null;
        }
    }

    private void acknowledge(Purchase purchase) {
        AcknowledgePurchaseParams params = AcknowledgePurchaseParams.newBuilder()
            .setPurchaseToken(purchase.getPurchaseToken())
            .build();
        billingClient.acknowledgePurchase(params, result -> {
            if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                JSObject event = new JSObject();
                event.put("message", "Purchase completed; Google Play acknowledgement will retry.");
                notifyListeners("billingWarning", event, true);
            }
        });
    }

    private String formattedPrice() {
        if (productDetails == null) return null;
        List<ProductDetails.OneTimePurchaseOfferDetails> offers = productDetails.getOneTimePurchaseOfferDetailsList();
        return offers == null || offers.isEmpty() ? null : offers.get(0).getFormattedPrice();
    }

    private JSObject statusObject(boolean entitled, boolean pending, String price, boolean available) {
        JSObject status = new JSObject();
        status.put("productId", PRODUCT_ID);
        status.put("entitled", entitled);
        status.put("pending", pending);
        status.put("available", available);
        status.put("price", price == null ? "£9.99" : price);
        return status;
    }

    private boolean readEntitlement() {
        return getContext().getSharedPreferences(PREFS, 0).getBoolean(ENTITLED, false);
    }

    private void saveEntitlement(boolean entitled) {
        getContext().getSharedPreferences(PREFS, 0).edit().putBoolean(ENTITLED, entitled).apply();
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult result, List<Purchase> purchases) {
        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (Purchase purchase : purchases) processPurchase(purchase);
            return;
        }
        if (activePurchaseCall != null) {
            if (result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
                JSObject cancelled = new JSObject();
                cancelled.put("cancelled", true);
                cancelled.put("entitled", readEntitlement());
                activePurchaseCall.resolve(cancelled);
            } else {
                activePurchaseCall.reject("Google Play purchase failed: " + result.getDebugMessage(), "PURCHASE_FAILED");
            }
            activePurchaseCall = null;
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (billingClient != null) billingClient.endConnection();
        super.handleOnDestroy();
    }
}
