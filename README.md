# Warpdroid

**Warpdroid** is a zero-friction CLI that builds, installs, and launches Android projects on your local emulator or device — one command instead of a dozen clicks in Android Studio.

Point it at any open-source Android project with a Gradle wrapper, and it will:

1. Build a debug APK (`gradlew assembleDebug`)
2. Boot an AVD if nothing is running (optional, via `--avd`)
3. Install the APK on the device
4. Resolve the package name and launcher activity automatically
5. Launch the app
6. Stream its `logcat` output live, filtered to that app's process

No manual APK hunting, no digging through `AndroidManifest.xml`, no juggling `adb` flags.

## Requirements

- [Node.js](https://nodejs.org) 16+
- Android SDK with `adb` and `emulator` on your `PATH` (anything installed by Android Studio works)
- Android SDK build-tools (`aapt`/`aapt2`) for automatic package/activity detection — falls back to parsing `AndroidManifest.xml` if unavailable
- A project with a Gradle wrapper (`gradlew` / `gradlew.bat`) — true of nearly every open-source Android repo

Warpdroid itself is cross-platform (Windows, macOS, Linux); it just shells out to the standard Android SDK tools.

## Install

```bash
git clone https://github.com/geekneuron/warpdroid.git
cd warpdroid
npm install
npm link
```

`npm link` puts the `warpdroid` command on your `PATH`. Alternatively, run it directly with `node bin/warpdroid.js`.

## Usage

```bash
# Build + install + launch + stream logs, using whatever device is already running
warpdroid run path/to/android-project

# Same, but boot a specific AVD first if nothing is connected
warpdroid run path/to/android-project --avd Pixel_6_API_34

# Just build a debug APK
warpdroid build path/to/android-project

# See what's connected and what AVDs are available
warpdroid devices

# Tail logs for an already-running app
warpdroid logs com.example.myapp

# Check that Java/adb/emulator/aapt/gradlew are all correctly set up
warpdroid doctor path/to/android-project

# Remove build outputs
warpdroid clean path/to/android-project

# Open a URL or deep link on the connected device
warpdroid open "https://example.com/product/42"
```

### Options for `run`

| Flag          | Description                                          |
| ------------- | ----------------------------------------------------- |
| `-a, --avd <name>` | Boot this AVD if no device/emulator is already running |
| `-q, --quiet`      | Suppress raw Gradle build output                      |
| `--no-logs`        | Skip streaming logcat after launch                     |

## Windows executable & installer

Warpdroid can be packaged as a standalone `warpdroid.exe` that runs without a Node.js install:

```bash
npm install
npm run build:exe
```

This produces `dist/warpdroid.exe`. From there:

- **Quick local install (no extra tools):** run `installer/install.ps1` in PowerShell — it copies the exe to `%LOCALAPPDATA%\Warpdroid` and adds it to your user `PATH`. Undo with `installer/uninstall.ps1`.
- **Proper Windows installer (`warpdroid-setup.exe`):** install [Inno Setup](https://jrsoftware.org/isdl.php), then run `npm run build:installer` (or `installer/build-installer.ps1` directly). The output lands in `installer/output/warpdroid-setup.exe` and includes a Start Menu entry, PATH registration, and an uninstaller.

## How it works

Warpdroid doesn't reimplement any part of the Android toolchain — it orchestrates the same tools Android Studio uses under the hood (`gradlew`, `emulator`, `adb`, `aapt`), so anything that builds and runs in Android Studio should work here too.

## Prior art

Warpdroid isn't the first CLI wrapper around the Android toolchain — projects like [`acli`](https://github.com/ErikHellman/cli-for-android), [`ktd`](https://github.com/AcharyaML/ktroid), [`dab`](https://github.com/cesarferreira/dab), and [`android-cli`](https://github.com/syedahkam/android-cli) cover similar ground and were useful references for command shape and feature ideas (environment doctoring, release signing, deep-link launching).

## Roadmap

- [ ] Hot-reload / incremental install on file changes
- [ ] Config file for per-project defaults (`.warpdroidrc`)
- [ ] Release-variant support and signing beyond `assembleDebug`
- [ ] Parallel multi-device install/launch
- [ ] `--json` output for CI/scripting

## Contributing

Issues and PRs welcome. This is an early scaffold — the core build → install → launch → logs pipeline works, but there's plenty of room to harden edge cases (flavors, multi-module projects, physical-device quirks, etc.).

## License

MIT — see [LICENSE](LICENSE).
