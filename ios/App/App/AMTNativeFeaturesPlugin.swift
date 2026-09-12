import Capacitor
import CryptoKit
import Foundation
import LocalAuthentication
import Security
import WatchConnectivity
import WidgetKit

@objc(AMTNativeFeaturesPlugin)
final class AMTNativeFeaturesPlugin: CAPPlugin, CAPBridgedPlugin {
    let identifier = "AMTNativeFeaturesPlugin"
    let jsName = "AMTNativeFeatures"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "authenticate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "loadSecureNotes", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveSecureNotes", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "deleteSecureNotes", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "updateSharedState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "consumePendingRoute", returnType: CAPPluginReturnPromise)
    ]

    private let appGroup = "group.uk.acutemedicine.acutemedicaltake"
    private let keyAccount = "encrypted-notes-key-v1"
    private let keyService = "uk.acutemedicine.acutemedicaltake.secure-notes"
    private var unlockedUntil = Date.distantPast

    @objc func authenticate(_ call: CAPPluginCall) {
        let context = LAContext()
        context.localizedCancelTitle = "Keep Locked"
        var error: NSError?
        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
            call.reject("Device authentication is unavailable", nil, error)
            return
        }
        context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: call.getString("reason") ?? "Unlock encrypted notes") { [weak self] success, authError in
            DispatchQueue.main.async {
                guard success else { call.reject("Authentication cancelled", nil, authError); return }
                self?.unlockedUntil = Date().addingTimeInterval(120)
                call.resolve()
            }
        }
    }

    @objc func loadSecureNotes(_ call: CAPPluginCall) {
        guard isUnlocked(call) else { return }
        do {
            let url = try notesURL()
            guard FileManager.default.fileExists(atPath: url.path) else { call.resolve(["text": ""]); return }
            let sealed = try AES.GCM.SealedBox(combined: Data(contentsOf: url))
            let clear = try AES.GCM.open(sealed, using: try encryptionKey())
            call.resolve(["text": String(decoding: clear, as: UTF8.self)])
        } catch { call.reject("Unable to decrypt notes", nil, error) }
    }

    @objc func saveSecureNotes(_ call: CAPPluginCall) {
        guard isUnlocked(call) else { return }
        guard let text = call.getString("text") else { call.reject("Missing note text"); return }
        do {
            let sealed = try AES.GCM.seal(Data(text.utf8), using: try encryptionKey())
            guard let combined = sealed.combined else { throw NotesError.encryptionFailed }
            let url = try notesURL()
            try combined.write(to: url, options: [.atomic, .completeFileProtection])
            var values = URLResourceValues()
            values.isExcludedFromBackup = true
            var mutableURL = url
            try mutableURL.setResourceValues(values)
            call.resolve()
        } catch { call.reject("Unable to encrypt notes", nil, error) }
    }

    @objc func deleteSecureNotes(_ call: CAPPluginCall) {
        guard isUnlocked(call) else { return }
        do {
            let url = try notesURL()
            if FileManager.default.fileExists(atPath: url.path) { try FileManager.default.removeItem(at: url) }
            call.resolve()
        } catch { call.reject("Unable to delete notes", nil, error) }
    }

    @objc func updateSharedState(_ call: CAPPluginCall) {
        let favourites = call.getArray("favourites", String.self) ?? []
        let timer = call.getObject("activeTimer")
        let defaults = UserDefaults(suiteName: appGroup)
        defaults?.set(favourites, forKey: "favourites")
        defaults?.set(timer, forKey: "activeTimer")
        WidgetCenter.shared.reloadAllTimelines()
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = AMTWatchSessionDelegate.shared
            session.activate()
            try? session.updateApplicationContext(["favourites": favourites, "activeTimer": timer ?? [:]])
        }
        call.resolve()
    }

    @objc func consumePendingRoute(_ call: CAPPluginCall) {
        let defaults = UserDefaults(suiteName: appGroup)
        let route = defaults?.string(forKey: "pendingRoute") ?? ""
        defaults?.removeObject(forKey: "pendingRoute")
        call.resolve(["route": route])
    }

    private func isUnlocked(_ call: CAPPluginCall) -> Bool {
        guard Date() < unlockedUntil else { call.reject("Notes are locked"); return false }
        return true
    }

    private func notesURL() throws -> URL {
        let directory = try FileManager.default.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        return directory.appendingPathComponent("amt-notes-v1.bin", isDirectory: false)
    }

    private func encryptionKey() throws -> SymmetricKey {
        let query: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: keyService, kSecAttrAccount as String: keyAccount, kSecReturnData as String: true]
        var result: CFTypeRef?
        if SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess, let data = result as? Data { return SymmetricKey(data: data) }
        let key = SymmetricKey(size: .bits256)
        let data = key.withUnsafeBytes { Data($0) }
        let add: [String: Any] = [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: keyService, kSecAttrAccount as String: keyAccount, kSecValueData as String: data, kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly]
        guard SecItemAdd(add as CFDictionary, nil) == errSecSuccess else { throw NotesError.keychainFailed }
        return key
    }
}

private enum NotesError: Error { case encryptionFailed, keychainFailed }

final class AMTWatchSessionDelegate: NSObject, WCSessionDelegate {
    static let shared = AMTWatchSessionDelegate()
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}
    func sessionDidBecomeInactive(_ session: WCSession) {}
    func sessionDidDeactivate(_ session: WCSession) { session.activate() }
}
