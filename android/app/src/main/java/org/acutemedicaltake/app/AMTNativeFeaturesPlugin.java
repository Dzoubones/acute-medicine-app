package org.acutemedicaltake.app;

import android.os.Build;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.concurrent.Executor;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

@CapacitorPlugin(name = "AMTNativeFeatures")
public class AMTNativeFeaturesPlugin extends Plugin {
    private static final String KEY_ALIAS = "amt_secure_notes_key";
    private static final String PREFS = "amt_secure_notes";
    private static final String CIPHER_TEXT = "cipher_text";
    private static final String IV = "iv";

    @PluginMethod
    public void authenticate(PluginCall call) {
        int authenticators = BiometricManager.Authenticators.BIOMETRIC_STRONG |
            BiometricManager.Authenticators.DEVICE_CREDENTIAL;
        BiometricManager manager = BiometricManager.from(getContext());
        if (manager.canAuthenticate(authenticators) != BiometricManager.BIOMETRIC_SUCCESS) {
            call.reject("Biometric or device credential authentication is unavailable.", "AUTH_UNAVAILABLE");
            return;
        }

        Executor executor = ContextCompat.getMainExecutor(getContext());
        BiometricPrompt prompt = new BiometricPrompt(
            (FragmentActivity) getActivity(),
            executor,
            new BiometricPrompt.AuthenticationCallback() {
                @Override
                public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                    call.resolve();
                }

                @Override
                public void onAuthenticationError(int errorCode, @NonNull CharSequence errorString) {
                    call.reject(errorString.toString(), "AUTH_CANCELLED");
                }
            }
        );
        BiometricPrompt.PromptInfo info = new BiometricPrompt.PromptInfo.Builder()
            .setTitle("Unlock AMT personal notes")
            .setSubtitle("Use your fingerprint, face or device passcode")
            .setAllowedAuthenticators(authenticators)
            .build();
        prompt.authenticate(info);
    }

    @PluginMethod
    public void loadSecureNotes(PluginCall call) {
        try {
            String encodedCipher = getContext().getSharedPreferences(PREFS, 0).getString(CIPHER_TEXT, null);
            String encodedIv = getContext().getSharedPreferences(PREFS, 0).getString(IV, null);
            JSObject result = new JSObject();
            if (encodedCipher == null || encodedIv == null) {
                result.put("text", "");
                call.resolve(result);
                return;
            }
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey(), new GCMParameterSpec(128, Base64.decode(encodedIv, Base64.NO_WRAP)));
            byte[] clear = cipher.doFinal(Base64.decode(encodedCipher, Base64.NO_WRAP));
            result.put("text", new String(clear, StandardCharsets.UTF_8));
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Authenticate again to open encrypted notes.", "NOTES_LOCKED", error);
        }
    }

    @PluginMethod
    public void saveSecureNotes(PluginCall call) {
        String text = call.getString("text", "");
        if (text.length() > 12000) {
            call.reject("Notes exceed the 12,000 character limit.", "NOTES_TOO_LONG");
            return;
        }
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey());
            byte[] encrypted = cipher.doFinal(text.getBytes(StandardCharsets.UTF_8));
            getContext().getSharedPreferences(PREFS, 0).edit()
                .putString(CIPHER_TEXT, Base64.encodeToString(encrypted, Base64.NO_WRAP))
                .putString(IV, Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP))
                .apply();
            call.resolve();
        } catch (Exception error) {
            call.reject("Authenticate again before saving encrypted notes.", "NOTES_LOCKED", error);
        }
    }

    @PluginMethod
    public void deleteSecureNotes(PluginCall call) {
        getContext().getSharedPreferences(PREFS, 0).edit().clear().apply();
        call.resolve();
    }

    @PluginMethod
    public void updateSharedState(PluginCall call) {
        call.resolve();
    }

    @PluginMethod
    public void consumePendingRoute(PluginCall call) {
        JSObject result = new JSObject();
        result.put("route", "");
        call.resolve(result);
    }

    private SecretKey getOrCreateKey() throws Exception {
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        if (keyStore.containsAlias(KEY_ALIAS)) {
            return ((KeyStore.SecretKeyEntry) keyStore.getEntry(KEY_ALIAS, null)).getSecretKey();
        }

        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        KeyGenParameterSpec.Builder builder = new KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setUserAuthenticationRequired(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            builder.setUserAuthenticationParameters(
                30,
                KeyProperties.AUTH_BIOMETRIC_STRONG | KeyProperties.AUTH_DEVICE_CREDENTIAL
            );
        } else {
            builder.setUserAuthenticationValidityDurationSeconds(30);
        }
        generator.init(builder.build());
        return generator.generateKey();
    }
}
