import SwiftUI
import UniformTypeIdentifiers

struct JSONDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.json] }
    var data: Data
    init(data: Data) { self.data = data }
    init(configuration: ReadConfiguration) throws { data = configuration.file.regularFileContents ?? Data() }
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper { FileWrapper(regularFileWithContents: data) }
}

struct ContentView: View {
    @Environment(\.scenePhase) private var scenePhase
    @State private var folderMode: FolderMode?
    @State private var showingFirmwarePicker = false
    @State private var showingBackupExporter = false
    @State private var backupDocument = JSONDocument(data: Data("{}".utf8))
    @State private var firmwareURL: URL?
    @State private var status = "Authorize the MT12 root and save a classic PAT."
    @State private var token = KeychainStore.get("classicPat")
    @State private var catalog = "Not loaded"
    @State private var busy = false

    enum FolderMode: Identifiable { case mt12, uf2; var id: Int { self == .mt12 ? 1 : 2 } }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 13) {
                    Text("A17Y MT12 Mobile Companion").font(.largeTitle.bold()).frame(maxWidth: .infinity, alignment: .leading)
                    Text("iPhone · verified sync and update handoff").font(.headline).frame(maxWidth: .infinity, alignment: .leading)
                    SecureField("Classic GitHub PAT (Keychain)", text: $token)
                        .textFieldStyle(.roundedBorder)
                        .onChange(of: token) { _, value in KeychainStore.set(value, key: "classicPat") }
                    Button("AUTHORIZE & VERIFY MT12 ROOT") { folderMode = .mt12 }.buttonStyle(.borderedProminent).frame(maxWidth: .infinity)
                    Button("SYNC LOGS TO GITHUB") { Task { await sync() } }.buttonStyle(.borderedProminent).frame(maxWidth: .infinity).disabled(busy)
                    Button("EXPORT VERIFIED BACKUP MANIFEST") { buildBackup() }.buttonStyle(.bordered).frame(maxWidth: .infinity)
                    Divider()
                    Button("GET LATEST EDGETX & ELRS") { Task { await refreshCatalog() } }.buttonStyle(.borderedProminent).frame(maxWidth: .infinity)
                    Text(catalog).font(.caption.monospaced()).frame(maxWidth: .infinity, alignment: .leading).lineLimit(12)
                    Button("SELECT OFFICIAL EDGETX UF2") { showingFirmwarePicker = true }.buttonStyle(.bordered).frame(maxWidth: .infinity)
                    Button("AUTHORIZE EDGETX_UF2 FOLDER") { folderMode = .uf2 }.buttonStyle(.bordered).frame(maxWidth: .infinity)
                    Button("COPY UF2 & VERIFY") { copyUF2() }.buttonStyle(.borderedProminent).frame(maxWidth: .infinity)
                    Button("OPEN ELRS WI-FI FLASHER") { UIApplication.shared.open(URL(string: "http://10.0.0.1")!) }.buttonStyle(.bordered).frame(maxWidth: .infinity)
                    Link("MT12 ELRS BUILD & FLASH GUIDE", destination: URL(string: "https://www.expresslrs.org/quick-start/transmitters/rm-internal/")!).buttonStyle(.bordered).frame(maxWidth: .infinity)
                    Text(status).font(.system(.footnote, design: .monospaced)).frame(maxWidth: .infinity, alignment: .leading).padding().background(.thinMaterial).clipShape(RoundedRectangle(cornerRadius: 14))
                    Text("Logs are marked imported only after GitHub confirms the uploaded blob. iOS syncs on app activation after you authorize the MT12 folder. UF2 source and destination hashes must match.").font(.caption).foregroundStyle(.secondary)
                }.padding()
            }
            .fileImporter(isPresented: Binding(get: { folderMode != nil }, set: { if !$0 { folderMode = nil } }), allowedContentTypes: [.folder], allowsMultipleSelection: false) { result in
                let mode = folderMode; folderMode = nil
                do {
                    let url = try result.get().first!
                    if mode == .mt12 && !MobileCore.validateMT12(url) { throw NSError(domain: "A17Y", code: 20, userInfo: [NSLocalizedDescriptionKey: "Choose the MT12 root containing LOGS and SCRIPTS/MODELS/RADIO."]) }
                    let bookmark = try url.bookmarkData(options: .minimalBookmark, includingResourceValuesForKeys: nil, relativeTo: nil)
                    UserDefaults.standard.set(bookmark, forKey: mode == .mt12 ? "mt12Bookmark" : "uf2Bookmark")
                    status = mode == .mt12 ? "Verified MT12 root authorized." : "UF2 destination authorized; it will be validated during copy."
                } catch { status = "Folder authorization failed: \(error.localizedDescription)" }
            }
            .fileImporter(isPresented: $showingFirmwarePicker, allowedContentTypes: [UTType(filenameExtension: "uf2") ?? .data], allowsMultipleSelection: false) { result in
                do {
                    firmwareURL = try result.get().first!
                    let data = try Data(contentsOf: firmwareURL!)
                    guard data.count > 100_000 else { throw NSError(domain: "A17Y", code: 21, userInfo: [NSLocalizedDescriptionKey: "UF2 is unexpectedly small"]) }
                    status = "Selected \(firmwareURL!.lastPathComponent)\nSHA-256: \(MobileCore.sha256(data))"
                } catch { status = "Firmware selection failed: \(error.localizedDescription)" }
            }
            .fileExporter(isPresented: $showingBackupExporter, document: backupDocument, contentType: .json, defaultFilename: "mt12-backup-manifest") { result in
                if case .failure(let error) = result { status = "Backup export failed: \(error.localizedDescription)" }
            }
            .task { await refreshCatalog(); await syncIfReady() }
            .onChange(of: scenePhase) { _, phase in if phase == .active { Task { await syncIfReady() } } }
        }
    }

    private func bookmarkURL(_ key: String) throws -> URL {
        guard let data = UserDefaults.standard.data(forKey: key) else { throw NSError(domain: "A17Y", code: 22, userInfo: [NSLocalizedDescriptionKey: "Folder authorization missing"]) }
        var stale = false
        let url = try URL(resolvingBookmarkData: data, options: [.withSecurityScope], relativeTo: nil, bookmarkDataIsStale: &stale)
        if stale { UserDefaults.standard.removeObject(forKey: key) }
        return url
    }

    @MainActor private func syncIfReady() async {
        guard !token.isEmpty, UserDefaults.standard.data(forKey: "mt12Bookmark") != nil else { return }
        await sync()
    }

    @MainActor private func sync() async {
        guard !busy else { return }; busy = true; defer { busy = false }
        do { status = "Syncing…"; status = try await MobileCore.sync(root: bookmarkURL("mt12Bookmark"), token: token) }
        catch { status = "Sync failed: \(error.localizedDescription)" }
    }

    @MainActor private func refreshCatalog() async {
        do { catalog = try await MobileCore.fetchCatalog(); status = "Official firmware catalog refreshed." }
        catch { catalog = "Catalog error: \(error.localizedDescription)" }
    }

    private func buildBackup() {
        do { backupDocument = JSONDocument(data: try MobileCore.backupManifest(root: bookmarkURL("mt12Bookmark"))); showingBackupExporter = true; status = "Backup manifest ready to export." }
        catch { status = "Backup failed: \(error.localizedDescription)" }
    }

    private func copyUF2() {
        do {
            guard let source = firmwareURL else { throw NSError(domain: "A17Y", code: 23, userInfo: [NSLocalizedDescriptionKey: "Select a UF2 first"]) }
            let target = try bookmarkURL("uf2Bookmark")
            guard source.startAccessingSecurityScopedResource(), target.startAccessingSecurityScopedResource() else { throw NSError(domain: "A17Y", code: 24, userInfo: [NSLocalizedDescriptionKey: "UF2 permission unavailable"]) }
            defer { source.stopAccessingSecurityScopedResource(); target.stopAccessingSecurityScopedResource() }
            let names = (try? FileManager.default.contentsOfDirectory(atPath: target.path)) ?? []
            guard target.lastPathComponent.uppercased().contains("EDGETX") || names.contains(where: { $0.uppercased() == "INFO_UF2.TXT" }) else { throw NSError(domain: "A17Y", code: 25, userInfo: [NSLocalizedDescriptionKey: "Destination is not EDGETX_UF2"]) }
            let sourceData = try Data(contentsOf: source)
            let destination = target.appendingPathComponent("firmware.uf2")
            try sourceData.write(to: destination, options: .atomic)
            let copied = try Data(contentsOf: destination)
            guard MobileCore.sha256(sourceData) == MobileCore.sha256(copied) else { throw NSError(domain: "A17Y", code: 26, userInfo: [NSLocalizedDescriptionKey: "UF2 verification failed"]) }
            status = "UF2 copied and verified: \(MobileCore.sha256(sourceData))"
        } catch { status = "UF2 copy failed: \(error.localizedDescription)" }
    }
}
