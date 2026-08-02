import Foundation
import CryptoKit
import Security

struct KeychainStore {
    static func set(_ value: String, key: String) {
        let data = Data(value.utf8)
        SecItemDelete([kSecClass: kSecClassGenericPassword, kSecAttrAccount: key] as CFDictionary)
        SecItemAdd([kSecClass: kSecClassGenericPassword, kSecAttrAccount: key, kSecValueData: data, kSecAttrAccessible: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly] as CFDictionary, nil)
    }
    static func get(_ key: String) -> String {
        var result: CFTypeRef?
        let q: [CFString: Any] = [kSecClass: kSecClassGenericPassword, kSecAttrAccount: key, kSecReturnData: true, kSecMatchLimit: kSecMatchLimitOne]
        guard SecItemCopyMatching(q as CFDictionary, &result) == errSecSuccess, let data = result as? Data else { return "" }
        return String(data: data, encoding: .utf8) ?? ""
    }
}

enum MobileCore {
    static let repo = "gymwhaleysspot-dot/mt12-jarvis-continuous"
    static let catalogURL = URL(string: "https://raw.githubusercontent.com/\(repo)/main/public/device-data/releases.json")!

    static func sha256(_ data: Data) -> String { SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined() }

    static func validateMT12(_ root: URL) -> Bool {
        let names = (try? FileManager.default.contentsOfDirectory(atPath: root.path).map { $0.uppercased() }) ?? []
        return names.contains("LOGS") && (names.contains("SCRIPTS") || names.contains("MODELS") || names.contains("RADIO"))
    }

    static func fetchCatalog() async throws -> String {
        let (data, response) = try await URLSession.shared.data(from: catalogURL)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else { throw NSError(domain: "A17Y", code: 10, userInfo: [NSLocalizedDescriptionKey: "Firmware catalog unavailable"]) }
        return String(data: data, encoding: .utf8) ?? "{}"
    }

    static func uploadLog(token: String, name: String, data: Data, hash: String) async throws -> String {
        guard token.hasPrefix("ghp_") else { throw NSError(domain: "A17Y", code: 11, userInfo: [NSLocalizedDescriptionKey: "Classic GitHub PAT required"]) }
        let safe = name.replacingOccurrences(of: "[^A-Za-z0-9._-]", with: "_", options: .regularExpression)
        let path = "tests/replays/mobile-\(Int(Date().timeIntervalSince1970 * 1000))-\(safe)"
        var req = URLRequest(url: URL(string: "https://api.github.com/repos/\(repo)/contents/\(path)")!)
        req.httpMethod = "PUT"
        req.setValue("token \(token)", forHTTPHeaderField: "Authorization")
        req.setValue("application/vnd.github+json", forHTTPHeaderField: "Accept")
        req.setValue("2022-11-28", forHTTPHeaderField: "X-GitHub-Api-Version")
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: ["message": "Import MT12 log \(safe) [\(hash)]", "content": data.base64EncodedString(), "branch": "main"])
        let (reply, response) = try await URLSession.shared.data(for: req)
        guard (response as? HTTPURLResponse)?.statusCode == 201,
              let obj = try JSONSerialization.jsonObject(with: reply) as? [String: Any],
              let content = obj["content"] as? [String: Any],
              !(content["sha"] as? String ?? "").isEmpty else {
            throw NSError(domain: "A17Y", code: 12, userInfo: [NSLocalizedDescriptionKey: "GitHub did not confirm upload"])
        }
        return path
    }

    static func sync(root: URL, token: String) async throws -> String {
        guard root.startAccessingSecurityScopedResource() else { throw NSError(domain: "A17Y", code: 13, userInfo: [NSLocalizedDescriptionKey: "Folder permission unavailable"]) }
        defer { root.stopAccessingSecurityScopedResource() }
        guard validateMT12(root) else { throw NSError(domain: "A17Y", code: 14, userInfo: [NSLocalizedDescriptionKey: "Selected folder is not an MT12 root"]) }
        let logs = root.appendingPathComponent("LOGS", isDirectory: true)
        let files = try FileManager.default.contentsOfDirectory(at: logs, includingPropertiesForKeys: nil).filter { $0.pathExtension.lowercased() == "csv" }
        var imported = Set(UserDefaults.standard.stringArray(forKey: "importedHashes") ?? [])
        var lines: [String] = []
        var count = 0
        for file in files {
            let data = try Data(contentsOf: file)
            let hash = sha256(data)
            if imported.contains(hash) { lines.append("KNOWN \(file.lastPathComponent)"); continue }
            let path = try await uploadLog(token: token, name: file.lastPathComponent, data: data, hash: hash)
            imported.insert(hash)
            UserDefaults.standard.set(Array(imported), forKey: "importedHashes")
            count += 1
            lines.append("UPLOADED \(file.lastPathComponent) → \(path)")
        }
        return "Uploaded \(count) new logs.\n" + lines.joined(separator: "\n")
    }

    static func backupManifest(root: URL) throws -> Data {
        guard root.startAccessingSecurityScopedResource() else { throw NSError(domain: "A17Y", code: 15, userInfo: [NSLocalizedDescriptionKey: "Folder permission unavailable"]) }
        defer { root.stopAccessingSecurityScopedResource() }
        guard validateMT12(root) else { throw NSError(domain: "A17Y", code: 16, userInfo: [NSLocalizedDescriptionKey: "Not an MT12 root"]) }
        let e = FileManager.default.enumerator(at: root, includingPropertiesForKeys: [.isRegularFileKey])
        var files: [[String: Any]] = []
        while let url = e?.nextObject() as? URL {
            let v = try url.resourceValues(forKeys: [.isRegularFileKey])
            if v.isRegularFile == true {
                let d = try Data(contentsOf: url)
                files.append(["path": url.path.replacingOccurrences(of: root.path + "/", with: ""), "size": d.count, "sha256": sha256(d)])
            }
        }
        return try JSONSerialization.data(withJSONObject: ["schema": 1, "radio": "RadioMaster MT12", "createdAt": ISO8601DateFormatter().string(from: Date()), "files": files], options: [.prettyPrinted])
    }
}
