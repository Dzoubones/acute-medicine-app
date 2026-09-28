package org.acutemedicaltake.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AMTBillingPlugin.class);
        registerPlugin(AMTNativeFeaturesPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
