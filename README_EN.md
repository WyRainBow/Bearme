<div align="center">

# 🐻 JokeBear Desktop Pet 🐻

<img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/bear.png" alt="JokeBear Desktop Pet" width="200"/>

<p><strong>Let a self-deprecating little bear warm your every day</strong></p>

</div>

> **Note:** This project is still in the development stage and is for testing purposes only.

## 📝 Project Introduction

JokeBear Desktop Pet is a desktop companion application based on Electron, which presents a cute bear figure on your desktop to accompany your work and study time. Whether it's a busy workday or relaxing free time, JokeBear will bring you joy and relaxation with humorous self-deprecating quotes and adorable animations.

## ✨ Features

- **Various Interactions**: Click, drag, feed, pet, and other interaction methods, each with different animations and reactions
- **Self-deprecating Quotes**: Regularly displays humorous self-deprecating quotes to relieve your work pressure
- **Multiple States**: Working, resting, running, waking up, and other state animations that are lively and interesting
- **Task System**: Daily tasks and interaction records to increase the fun of use
- **Custom Settings**: Adjustable size, transparency, interaction frequency, and other settings
- **System Tray**: Minimize to the system tray, ready to be awakened at any time

## 🖼️ Preview

<div align="center">
  <img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/bear1.png" alt="JokeBear" width="300"/>
  <img src="http://find.kingdomofown.cn/wp-content/uploads/2025/05/bear2.png" alt="UI Interface" width="300"/>
</div>

## 📥 Installation

### System Requirements
- Windows 10/11
- Or other platforms that support Electron

### Download and Install
1. Download the latest version from the [release page](https://github.com/Chujie-cre/JokeBear-Deskpet/releases)
2. Extract the files to your desired location
3. Run `start.bat` or the executable file in the `dist` folder

### Run from Source Code
```bash
# Clone the repository
git clone https://github.com/Chujie-cre/JokeBear-Deskpet.git

# Enter the project directory
cd JokeBear-Deskpet

# Install dependencies
npm install

# Start the application
npm start
```

## 📖 User Guide

- **Launch Application**: Double-click the application icon or run start.bat to launch JokeBear
- **Basic Interactions**: 
  - Click on the bear to trigger random interactions
  - Drag the bear to any position on the desktop
  - Right-click to open the menu
- **Main Page**: Access the main page via the system tray icon or right-click menu to view pet status, daily tasks, and interaction options
- **Settings Page**: Access settings in the main page to customize pet appearance and behavior

## 🛠️ Development Technologies

- **Framework**: Electron
- **Frontend**: HTML, CSS, JavaScript
- **UI Design**: Modern UI interface using FontAwesome icons
- **Packaging Tool**: electron-builder

## 📂 Project Structure

```
JokeBear-Deskpet/
├── assets/             # Resource folder (images, animations, etc.)
├── src/                # Source code
│   ├── main.js         # Main process code
│   ├── preload.js      # Preload script
│   └── renderer/       # Renderer process code
│       ├── index.html  # Main window HTML
│       ├── home.html   # Home page HTML
│       ├── home.js     # Home page script
│       └── ...         # Other interface and style files
├── dist/               # Build output directory
└── package.json        # Project configuration
```

## 🤝 Contribution

We welcome all forms of contributions, whether new features, documentation improvements, or bug fixes:

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 🚀 Project Planning

- [ ] Add more interactive animations
- [ ] Support user-defined images and quotes
- [ ] Add more themes and skins
- [ ] Implement network synchronization
- [ ] Add sound effects

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).

## 📮 Contact

- Project Maintainer: [Chujie-cre](https://github.com/Chujie-cre)
- Project Link: [GitHub Repository](https://github.com/Chujie-cre/JokeBear-Deskpet)

---

<div align="center">
  <p>Let a self-deprecating little bear warm your every day</p>
  <p>Copyright © 2025 ChujieJie</p>
</div> 