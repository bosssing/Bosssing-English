# Word Floater / 单词悬浮提示器

A lightweight, always-on-top floating word reminder for Windows. It displays vocabulary words from Excel files on a transparent floating window, helping you learn words while using your computer.

一个轻量级的 Windows 屏幕悬浮式单词提示器。从 Excel 文件中读取单词数据，在透明悬浮窗口中显示，让你在使用电脑的同时轻松背单词。

---

## Features / 功能特性

- **Floating Window** — Frameless, transparent, always-on-top window with gradient transparency at the bottom, keeping your workspace unobstructed.
  **悬浮窗口** — 无边框透明窗口，始终置顶，底部渐变透明，不遮挡工作区域。

- **Excel Data Source** — Reads word data from `.xlsx` / `.xls` files, automatically parsing word, phonetic transcription, and definition columns.
  **Excel 数据源** — 从 `.xlsx` / `.xls` 文件读取单词数据，自动解析单词、音标、释义列。

- **Interactive Progress Bar** — Drag the slider to quickly jump to any word; real-time position label shows current/total count (e.g. "5/20").
  **交互式进度条** — 拖动滑块快速定位到任意单词，实时显示当前序号/总数。

- **Auto & Manual Switching** — Auto-play with configurable speed (1–30s), or manually navigate with prev/next buttons and keyboard arrow keys.
  **自动/手动切换** — 自动播放，可调节速度（1–30秒），也可用按钮或键盘左右箭头手动切换。

- **State Persistence** — Remembers your last word position, playback speed, and play/pause state across sessions.
  **状态记忆** — 每次启动自动恢复上次的单词位置、播放速度和播放状态。

- **System Tray** — Minimizes to system tray; right-click menu for show/hide, open file, and quit.
  **系统托盘** — 最小化到系统托盘，右键菜单支持显示/隐藏、打开文件、退出。

- **Global Hotkey** — Press `Ctrl+Shift+W` to toggle window visibility from anywhere.
  **全局快捷键** — 任何界面按 `Ctrl+Shift+W` 切换窗口显示/隐藏。

- **Window Dragging** — Drag the title bar to reposition; resizable window.
  **窗口拖拽** — 拖拽标题栏移动窗口位置，支持调整窗口大小。

---

## Project Structure / 项目结构

```
English-Word/
├── src/
│   ├── main.js              # Electron main process / 主进程
│   ├── utils/
│   │   └── excelParser.js   # Excel parsing utility / Excel解析工具
│   ├── renderer/
│   │   ├── index.html       # UI layout / 界面结构
│   │   ├── style.css        # Styles & animations / 样式与动画
│   │   ├── app.js           # UI logic & interactions / 界面交互逻辑
│   │   └── preload.js       # Secure IPC bridge / 安全桥接
│   └── assets/
│       └── icon.ico         # Application icon / 应用图标
├── 12.28考研英语词汇乱序版2.xlsx  # Sample word data / 示例单词数据
├── package.json
└── README.md
```

---

## Getting Started / 快速开始

### Prerequisites / 前置条件

- [Node.js](https://nodejs.org/) 16+ (for development only / 仅开发时需要)

### Install & Run / 安装与运行

```bash
# Install dependencies / 安装依赖
npm install

# Start the app / 启动应用
npm start
```

### Build / 打包

```bash
# Package as Windows executable / 打包为 Windows 可执行文件
npm run pack
```

The output will be in `release/单词悬浮提示器-win32-x64/`. Copy the entire folder to any Windows PC and double-click `单词悬浮提示器.exe` to run — no installation required.

打包输出在 `release/单词悬浮提示器-win32-x64/` 目录下。将整个文件夹复制到任意 Windows 电脑，双击 `单词悬浮提示器.exe` 即可运行，无需安装。

---

## Usage / 使用说明

1. **Launch** — Start the app, it will automatically load the bundled Excel file.
   **启动** — 运行应用，自动加载内置的 Excel 单词文件。

2. **Navigate** — Use prev/next buttons, keyboard arrows, or drag the progress bar slider.
   **导航** — 使用上一个/下一个按钮、键盘箭头键，或拖动进度条滑块切换单词。

3. **Auto-play** — Click the play button to auto-advance; adjust speed with the slider (1–30s).
   **自动播放** — 点击播放按钮自动切换单词，用滑块调节速度（1–30秒）。

4. **Open file** — Click the file icon to load a different Excel file.
   **打开文件** — 点击文件图标加载其他 Excel 文件。

5. **Hide/Show** — Press `Ctrl+Shift+W` or click the close button to toggle visibility.
   **隐藏/显示** — 按 `Ctrl+Shift+W` 或点击关闭按钮切换窗口可见性。

6. **Move** — Drag the title bar to reposition the window anywhere on screen.
   **移动** — 拖拽标题栏将窗口移动到屏幕任意位置。

---

## Excel File Format / Excel 文件格式

The app automatically detects columns containing words, phonetics, and definitions. Supported formats:

应用会自动识别包含单词、音标、释义的列，支持以下格式：

| word / 单词 | phonetic / 音标 | definition / 释义 |
|---|---|---|
| abandon | /əˈbændən/ | v. 放弃；抛弃 |
| ability | /əˈbɪləti/ | n. 能力；才能 |

---

## Tech Stack / 技术栈

- **Electron 28** — Cross-platform desktop framework / 跨平台桌面框架
- **XLSX** — Excel file parsing library / Excel 文件解析库
- **Native HTML/CSS/JS** — No frontend framework overhead / 无前端框架开销

---

## System Requirements / 系统要求

| Requirement | Minimum |
|---|---|
| OS / 操作系统 | Windows 7+ |
| RAM / 内存 | 512 MB |
| Disk / 磁盘 | ~230 MB (packaged) |

---

## License / 许可证

MIT
