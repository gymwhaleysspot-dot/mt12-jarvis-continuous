import SwiftUI
import UniformTypeIdentifiers
import CryptoKit

struct ContentView: View {
    @State private var showingFolderPicker = false
    @State private var showingFirmwarePicker = false
    @State private var status = "Authorize the MT12 folder once, then press Sync MT12 whenever the drive is connected."
    @State private var token = UserDefaults.standard.string(forKey: "classicPat") ?? ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 14) {
                    Text("A17Y MT12 Mobile Companion").font(.largeTitle.bold()).frame(maxWidth: .infinity, alignment: .leading)
                    Text("iPhone").font(.headline).frame(maxWidth: .infinity, alignment: .leading)
                    Button("AUTHORIZE MT12 FOLDER") { showingFolderPicker = true }.buttonStyle(.borderedProminent).frame(maxWidth: .infinity)
                    Button("SYNC MT12 LOGS") { syncLogs() }.buttonStyle(.borderedProminent).frame(maxWidth: .infinity)
                    Button("SELECT EDGETX UF2") { showingFirmwarePicker = true }.buttonStyle(.bordered).frame(maxWidth: .infinity)
                    Button("OPEN ELRS WI-FI FLASHER") {
                        if let url = URL(string: "http://10.0.0.1") { UIApplication.shared.open(url) }
                    }.buttonStyle(.bordered).frame(maxWidth: .infinity)
                    SecureField("Classic GitHub PAT", text: $token)
                        .textFieldStyle(.roundedBorder)
                        .onChange(of: token) { _, value in UserDefaults.standard.set(value, forKey: "classicPat") }
                    Text(status).font(.system(.footnote, design: .monospaced)).frame(maxWidth: .infinity, alignment: .leading).padding().background(.thinMaterial).clipShape(RoundedRectangle(cornerRadius: 14))
                    Text("iOS remembers a user-authorized folder with a security-scoped bookmark. It cannot silently enumerate arbitrary USB storage in the background. Sync runs when the app opens or when you press the button. Firmware is verified and exported through Files; ELRS uses the official Wi-Fi interface.")
                        .font(.caption).foregroundStyle(.secondary)
                }.padding()
            }
            .fileImporter(isPresented: $showingFolderPicker, allowedContentTypes: [.folder], allowsMultipleSelection: false) { result in
                do {
                    let url = try result.get().first!
                    let bookmark = try url.bookmarkData(options: .minimalBookmark, includingResourceValuesForKeys: nil, relativeTo: nil)
                    UserDefaults.standard.set(bookmark, forKey: "mt12Bookmark")
                    status = "MT12 folder authorized."
                } catch { status = "Folder authorization failed: \(error.localizedDescription)" }
            }
            .fileImporter(isPresented: $showingFirmwarePicker, allowedContentTypes: [UTType(filenameExtension: "uf2") ?? .data], allowsMultipleSelection: false) { result in
                do {
                    let url = try result.get().first!
                    let data = try Data(contentsOf: url)
                    status = "Selected \(url.lastPathComponent)\nSHA-256: \(sha256(data))\nUse Files to copy only after target, backup, battery and approval checks pass."
                } catch { status = "Firmware selection failed: \(error.localizedDescription)" }
            }
        }
    }

    private func authorizedRoot() throws -> URL {
        guard let bookmark = UserDefaults.standard.data(forKey: "mt12Bookmark") else { throw NSError(domain: "A17Y", code: 1, userInfo: [NSLocalizedDescriptionKey: "Authorize the MT12 folder first."]) }
        var stale = false
        let url = try URL(resolvingBookmarkData: bookmark, options: [.withSecurityScope], relativeTo: nil, bookmarkDataIsStale: &stale)
        if stale {
            let renewed = try url.bookmarkData(options: .minimalBookmark, includingResourceValuesForKeys: nil, relativeTo: nil)
            UserDefaults.standard.set(renewed, forKey: "mt12Bookmark")
        }
        return url
    }

    private func syncLogs() {
        do {
            let root = try authorizedRoot()
            guard root.startAccessingSecurityScopedResource() else { throw NSError(domain: "A17Y", code: 2, userInfo: [NSLocalizedDescriptionKey: "Folder permission is unavailable."]) }
            defer { root.stopAccessingSecurityScopedResource() }
            let logs = root.appendingPathComponent("LOGS", isDirectory: true)
            let base = FileManager.default.fileExists(atPath: logs.path) ? logs : root
            let files = try FileManager.default.contentsOfDirectory(at: base, includingPropertiesForKeys: [.fileSizeKey], options: [.skipsHiddenFiles]).filter { $0.pathExtension.lowercased() == "csv" }
            var seen = Set(UserDefaults.standard.stringArray(forKey: "seenHashes") ?? [])
            var output: [String] = []
            var fresh = 0
            for file in files {
                let data = try Data(contentsOf: file)
                let hash = sha256(data)
                if seen.insert(hash).inserted { fresh += 1; output.append("NEW \(file.lastPathComponent) \(data.count) bytes \(hash)") }
                else { output.append("KNOWN \(file.lastPathComponent)") }
            }
            UserDefaults.standard.set(Array(seen), forKey: "seenHashes")
            status = "Found \(files.count) CSV files; \(fresh) new.\n" + output.joined(separator: "\n")
        } catch { status = "Sync failed: \(error.localizedDescription)" }
    }

    private func sha256(_ data: Data) -> String {
        SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
    }
}
