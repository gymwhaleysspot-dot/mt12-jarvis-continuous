# A17Y MT12 Native Helper

Cross-platform Node 22 helper for Windows, macOS, and Linux.

## Capabilities

- Detects mounted MT12 storage and `EDGETX_UF2` volumes.
- Watches for MT12 connection and imports unseen CSV logs by SHA-256.
- Optionally commits and pushes imported logs to `tests/replays/`.
- Creates complete radio backups with a hash manifest.
- Copies an official MT12 `.uf2` file to `EDGETX_UF2` and verifies the copied bytes.
- Opens the official ExpressLRS Configurator with an A17Y profile handoff.
- Records local update and recovery history under `~/.a17y-mt12/`.
- Provides a localhost control page.

## Start

```bash
cd desktop-helper
node helper.mjs detect
node helper.mjs watch
node server.mjs
```

Open `http://127.0.0.1:17303` for the local control panel.

To automatically commit new logs, run from a checked-out repository with a configured Git credential:

```bash
A17Y_AUTO_PUSH=1 node helper.mjs watch
```

## EdgeTX MT12 update

The helper uses the MT12-safe UF2 path. Put the MT12 into bootloader mode, connect it, confirm the `EDGETX_UF2` drive appears, then run:

```bash
node helper.mjs flash-edgetx /path/to/official-mt12-firmware.uf2
```

The helper refuses non-UF2 files and refuses any destination not named `EDGETX_UF2`. It hashes the source and destination before recording the update. The radio may unmount itself after accepting the file.

## ExpressLRS

Install the official ExpressLRS Configurator, generate the MT12 profile from the Device Center, then run:

```bash
node helper.mjs open-elrs /path/to/mt12-elrs-profile.json
```

The target remains `RadioMaster MT12 Internal 2.4GHz TX`. The official Configurator performs the supported build and Wi-Fi or EdgeTX-passthrough flash. The helper does not invent undocumented serial commands.

## Safety

Back up the radio before updating. Confirm the exact MT12 target, official firmware source, regulatory domain, and digest. Do not disconnect power during flashing.
