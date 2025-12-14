# Deriv Market Watcher - Browser Extension

## 🚀 Overview
**Deriv Market Watcher** is a lightweight browser extension designed to enhance trading efficiency on the Deriv platform. It solves the problem of constant chart monitoring by providing customizable, real-time audio and visual alarms when market prices hit specific target thresholds.

This tool helps traders automate their monitoring workflow, reducing screen time and ensuring no critical market movements are missed.

## ✨ Key Features
* **Real-Time Monitoring:** Tracks asset prices directly from the active trading window with zero latency.
* **Customizable Thresholds:** Users can set dynamic "Upper" and "Lower" price limits for alerts.
* **Instant Notifications:** Triggers immediate audio alerts and UI indicators when conditions are met.
* **Non-Intrusive Integration:** Injects a clean, draggable control panel directly into the Deriv interface without disrupting core functionality.
* **Optimized Performance:** Built with vanilla JavaScript to ensure minimal memory usage and no lag impact on trading execution.

## 🛠️ Tech Stack
* **Core:** JavaScript (ES6+), HTML5, CSS3.
* **Architecture:** Manifest V3 (Web Extensions API).
* **DOM Manipulation:** `MutationObserver` API for tracking real-time price updates.
* **Storage:** LocalStorage API to save user preferences and alert configurations.

## 📸 Screenshots
*(Include a screenshot of your extension running on the Deriv page here)*

## 📦 Installation
1.  Clone this repository:
    ```bash
    git clone [https://github.com/W4lterRomero/deriv-alarm-extension.git](https://github.com/W4lterRomero/deriv-alarm-extension.git)
    ```
2.  Open your browser (Chrome/Edge/Brave) and navigate to `chrome://extensions`.
3.  Enable **"Developer mode"** in the top right corner.
4.  Click **"Load unpacked"** and select the project folder.
5.  Navigate to Deriv and start trading with automated alerts!

## 🤝 Contribution
Contributions are welcome! If you have ideas for new indicators or features (like RSI integration), feel free to open a Pull Request.

---
**Author:** Walter Romero
*Full Stack Developer | Specialist in Web Solutions & Automation*
