import Foundation
import CryptoKit
import Security

struct KeychainStore {
    static func set(_ value: String, key: String) {
        let data = Data(value.utf8)
        SecItemDelete([
            kSecClass: kSecClassGenericPassword,
            kSecAttrAccount: key
        ] as CFDictionary)
        SecItemAdd([
            kSecClass: kSecClassGenericPassword,
            kSecAttrAccount: key,
            kSecValueData: data,
            kSecAttrAccessible: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        ] as CFDictionary, nil)
    }

    static func get(_ key: String) -> String {
        var result: CFTypeRef?
        let query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrAccount: key,
            kSecReturnData: true,
            kSecMatchLimit: kSecMatchLimitOne
        ]
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else {
            return ""
        }
        return String(data: data, encoding: .utf8) ?? ""
    }
}

enum MobileCore {
    static let repo = "gymwhaleysspot-dot/mt12-jarvis-continuous"
    static let catalogURL = URL(string: "https://raw.githubusercontent.com/\(repo)/main/public/device-data/releases.json")!
    static let logIndexURL = URL(string: "https://raw.githubusercontent.com/\(repo)/main/public/control-data/log-hashes.json")!
    static let builderResultsURL = URL(string: "https://github.com/\(repo)/actions/workflows/workbench.yml")!

    static func sha256(_ data: Data) -> String {
        SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
    }

    static func validateMT12(_ root: URL) -> Bool {
        let names = (try? FileManager.default.contentsOfDirectory(atPath: root.path)
            .map { $0.uppercased() }) ?? []
        return names.contains("LOGS") &&
            (names.contains("SCRIPTS") || names.contains("MODELS") || names.contains("RADIO"))
    }

    static func request(
        _ url: URL,
        method: String = "GET",
        token: String? = nil,
        json: Any? = nil
    ) async throws -> (Data, HTTPURLResponse) {
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/vnd.github+json", forHTTPHeaderField: "Accept")
        request.setValue("2022-11-28", forHTTPHeaderField: "X-GitHub-Api-Version")
        if let token, !token.isEmpty {
            request.setValue("token \(token)", forHTTPHeaderField: "Authorization")
        }
        if let json {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: json)
        }
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw NSError(domain: "A17Y", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid HTTP response"])
        }
        return (data, http)
    }

    static func runLuacAIBuilder(token: String, child: String, mission: String) async throws -> String {
        guard token.hasPrefix("ghp_") else {
            throw NSError(domain: "A17Y", code: 30, userInfo: [NSLocalizedDescriptionKey: "Classic GitHub PAT required"])
        }
        let source = child.trimmingCharacters(in: .whitespacesAndNewlines)
        if !source.isEmpty {
            let protected = source == "a17y.lua" || source.hasPrefix("protected/") ||
                source.hasPrefix(".github/") || source.hasPrefix("toolchain/")
            guard source.lowercased().hasSuffix(".lua") && !protected else {
                throw NSError(
                    domain: "A17Y",
                    code: 31,
                    userInfo: [NSLocalizedDescriptionKey: "Use a safe candidate path or leave blank for AI generation from protected A17Y"]
                )
            }
        }
        let trimmedMission = mission.trimmingCharacters(in: .whitespacesAndNewlines)
        let task = trimmedMission.isEmpty
            ? "Build the strongest verified MT12 LUAC without regressions"
            : trimmedMission
        let payload: [String: Any] = [
            "ref": "main",
            "inputs": [
                "child": source,
                "mission": task,
                "generate": source.isEmpty ? "true" : "false"
            ]
        ]
        let url = URL(string: "https://api.github.com/repos/\(repo)/actions/workflows/workbench.yml/dispatches")!
        let (body, response) = try await request(url, method: "POST", token: token, json: payload)
        guard response.statusCode == 204 else {
            let message = String(data: body, encoding: .utf8) ?? "unknown"
            throw NSError(domain: "A17Y", code: 32, userInfo: [NSLocalizedDescriptionKey: "LUAC builder dispatch failed: \(message)"])
        }
        let mode = source.isEmpty ? "AI diagnosis, generation and repair" : "verify existing candidate"
        return "Full LUAC AI pipeline started.\nMode: \(mode)\nMission: \(task)"
    }

    static func fetchCatalogData() async throws -> Data {
        let (data, response) = try await URLSession.shared.data(from: catalogURL)
        guard (response as? HTTPURLResponse)?.statusCode == 200 else {
            throw NSError(domain: "A17Y", code: 10, userInfo: [NSLocalizedDescriptionKey: "Firmware catalog unavailable"])
        }
        return data
    }

    static func fetchCatalog() async throws -> String {
        let data = try await fetchCatalogData()
        return String(data: data, encoding: .utf8) ?? "{}"
    }

    static func repositoryLogHashes() async -> Set<String> {
        guard let (data, response) = try? await URLSession.shared.data(from: logIndexURL),
              (response as? HTTPURLResponse)?.statusCode == 200,
              let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let files = object["files"] as? [[String: Any]] else {
            return []
        }
        return Set(files.compactMap { $0["sha256"] as? String })
    }

    static func officialFirmwareMatch(catalog: Data, fileName: String, hash: String) -> Bool {
        guard let root = try? JSONSerialization.jsonObject(with: catalog) else { return false }
        func scan(_ value: Any) -> Bool {
            if let dictionary = value as? [String: Any] {
                if let digest = dictionary["sha256"] as? String,
                   let name = dictionary["name"] as? String,
                   digest.caseInsensitiveCompare(hash) == .orderedSame,
                   name.caseInsensitiveCompare(fileName) == .orderedSame {
                    return true
                }
                return dictionary.values.contains(where: scan)
            }
            if let array = value as? [Any] {
                return array.contains(where: scan)
            }
            return false
        }
        return scan(root)
    }

    static func uploadLog(
        token: String,
        name: String,
        data: Data,
        hash: String,
        remote: Set<String>
    ) async throws -> String {
        guard token.hasPrefix("ghp_") else {
            throw NSError(domain: "A17Y", code: 11, userInfo: [NSLocalizedDescriptionKey: "Classic GitHub PAT required"])
        }
        guard !remote.contains(hash) else {
            throw NSError(domain: "A17Y", code: 17, userInfo: [NSLocalizedDescriptionKey: "This log already exists in the repository"])
        }
        let safe = name.replacingOccurrences(of: "[^A-Za-z0-9._-]", with: "_", options: .regularExpression)
        let path = "tests/replays/mobile-\(Int(Date().timeIntervalSince1970 * 1000))-\(safe)"
        let payload: [String: Any] = [
            "message": "Import MT12 log \(safe) [\(hash)]",
            "content": data.base64EncodedString(),
            "branch": "main"
        ]
        let url = URL(string: "https://api.github.com/repos/\(repo)/contents/\(path)")!
        let (reply, response) = try await request(url, method: "PUT", token: token, json: payload)
        guard response.statusCode == 201,
              let object = try JSONSerialization.jsonObject(with: reply) as? [String: Any],
              let content = object["content"] as? [String: Any],
              let confirmed = content["sha"] as? String,
              !confirmed.isEmpty else {
            throw NSError(domain: "A17Y", code: 12, userInfo: [NSLocalizedDescriptionKey: "GitHub did not confirm upload"])
        }
        return path
    }

    static func sync(root: URL, token: String) async throws -> String {
        guard root.startAccessingSecurityScopedResource() else {
            throw NSError(domain: "A17Y", code: 13, userInfo: [NSLocalizedDescriptionKey: "Folder permission unavailable"])
        }
        defer { root.stopAccessingSecurityScopedResource() }
        guard validateMT12(root) else {
            throw NSError(domain: "A17Y", code: 14, userInfo: [NSLocalizedDescriptionKey: "Selected folder is not an MT12 root"])
        }
        let logs = root.appendingPathComponent("LOGS", isDirectory: true)
        let files = try FileManager.default.contentsOfDirectory(at: logs, includingPropertiesForKeys: nil)
            .filter { $0.pathExtension.lowercased() == "csv" }
        var imported = Set(UserDefaults.standard.stringArray(forKey: "importedHashes") ?? [])
        let remote = await repositoryLogHashes()
        var lines: [String] = []
        var count = 0
        for file in files {
            let data = try Data(contentsOf: file)
            let hash = sha256(data)
            if imported.contains(hash) || remote.contains(hash) {
                lines.append("KNOWN \(file.lastPathComponent)")
                imported.insert(hash)
                continue
            }
            let path = try await uploadLog(
                token: token,
                name: file.lastPathComponent,
                data: data,
                hash: hash,
                remote: remote
            )
            imported.insert(hash)
            UserDefaults.standard.set(Array(imported), forKey: "importedHashes")
            count += 1
            lines.append("UPLOADED \(file.lastPathComponent) → \(path)")
        }
        return "Uploaded \(count) new logs.\n" + lines.joined(separator: "\n")
    }

    static func backupManifest(root: URL) throws -> Data {
        guard root.startAccessingSecurityScopedResource() else {
            throw NSError(domain: "A17Y", code: 15, userInfo: [NSLocalizedDescriptionKey: "Folder permission unavailable"])
        }
        defer { root.stopAccessingSecurityScopedResource() }
        guard validateMT12(root) else {
            throw NSError(domain: "A17Y", code: 16, userInfo: [NSLocalizedDescriptionKey: "Not an MT12 root"])
        }
        let enumerator = FileManager.default.enumerator(at: root, includingPropertiesForKeys: [.isRegularFileKey])
        var files: [[String: Any]] = []
        while let url = enumerator?.nextObject() as? URL {
            let values = try url.resourceValues(forKeys: [.isRegularFileKey])
            if values.isRegularFile == true {
                let data = try Data(contentsOf: url)
                files.append([
                    "path": url.path.replacingOccurrences(of: root.path + "/", with: ""),
                    "size": data.count,
                    "sha256": sha256(data)
                ])
            }
        }
        return try JSONSerialization.data(withJSONObject: [
            "schema": 2,
            "radio": "RadioMaster MT12",
            "createdAt": ISO8601DateFormatter().string(from: Date()),
            "files": files
        ], options: [.prettyPrinted])
    }
}
