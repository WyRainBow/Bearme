<div align="center">
  <img src="assets/zichao-bear-sticker.gif" width="120" alt="Bearme desk pet">

  <h1>Bearme</h1>

  <p>
    A tiny Electron desktop pet for macOS、with animated skins、a clean control panel、
    status-bar controls、 and Codex quota monitoring.
  </p>

  <p>
    <img alt="Electron" src="https://img.shields.io/badge/Electron-28-47848F?logo=electron&logoColor=white">
    <img alt="macOS" src="https://img.shields.io/badge/macOS-supported-111111?logo=apple&logoColor=white">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-green">
  </p>
</div>

## Preview

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="assets/自嘲熊加油.GIF" width="140" alt="Running skin"><br>
        <sub>Running</sub>
      </td>
      <td align="center">
        <img src="assets/自嘲熊work.gif" width="140" alt="Working skin"><br>
        <sub>Working</sub>
      </td>
      <td align="center">
        <img src="assets/自嘲熊tk.gif" width="140" alt="Wake skin"><br>
        <sub>Wake</sub>
      </td>
      <td align="center">
        <img src="assets/自嘲熊sticker.gif" width="140" alt="Sticker skin"><br>
        <sub>Sticker</sub>
      </td>
      <td align="center">
        <img src="assets/自嘲熊玫瑰花.GIF" width="140" alt="Rose skin"><br>
        <sub>Rose</sub>
      </td>
    </tr>
  </table>
</div>

## Features

- Desktop pet window with transparent background and click-through support.
- macOS status-bar menu for home, pet management, settings, show/hide, reload, and quit.
- Home dashboard with pet status, quick interactions, and Codex quota usage.
- Multiple built-in skins, including animated GIF skins.
- Custom avatar and custom pet skin upload.
- Pet state switching from the management page.
- Optional Codex quota rings around the pet, plus a Codex quota card in the home dashboard.
- Focused macOS launch script with `npm run start:mac`.

## Codex Quota

Bearme can show Codex usage from the local Codex environment:

- Live usage is fetched through the Codex auth token when available.
- If live usage is unavailable, it falls back to the local Codex SQLite logs.
- The desktop pet keeps subtle quota rings.
- The home dashboard shows `5h / Session` and `Weekly` remaining quota.

No extra setup is needed if Codex is already logged in on your machine.

## Quick Start

```bash
git clone https://github.com/WyRainBow/Bearme.git
cd Bearme
npm install
npm run start:mac
```

For a generic Electron launch:

```bash
npm start
```

## Development

Run tests:

```bash
npm test
```

Build packaged output:

```bash
npm run build
```

## Project Structure

```text
assets/                 Pet images, GIF skins, tray icon, preview assets
docs/                   Notes about asset editing workflows
src/main.js             Electron main process and app windows
src/main/codex-usage.js Codex quota polling and fallback logic
src/renderer/           Desktop pet, home dashboard, settings UI
src/shared/             Shared skin and pet-state helpers
test/                   Lightweight regression tests
```

## Skin Notes

Built-in skins are configured in:

```text
src/shared/skins.js
```

The working GIF was cleaned frame-by-frame to remove sweat marks while keeping the original animation. The process is documented in:

```text
docs/remove-sweat-from-gif.md
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run start:mac` | Launch Electron on macOS with the local project path |
| `npm start` | Standard Electron launch |
| `npm test` | Run regression tests |
| `npm run build` | Build packaged output with electron-builder |

## License

MIT. See [LICENSE](LICENSE).
