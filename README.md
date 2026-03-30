# UFC Mobile Application (iOS & Android)

A React Native mobile companion for the [UFC API](https://github.com/Icepikd3v/ufc-api) project.  
Manage UFC fighters — view, add, update, and delete fighter info — right from your phone.

![Platform](https://img.shields.io/badge/platform-react--native-lightblue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📲 Features

- **Home Screen**

  - Welcome message & navigation to dashboard

- **Fighters Dashboard**

  - List all fighters
  - Tap a fighter to view details
  - Add new fighter

- **Fighter Detail View**

  - See full details of any fighter
  - Edit or delete options

- **Forms**
  - Add/Update fighter with: Name, Age, Wins, Losses, Region, League

---

## Notes

- Fighter profile images are intentionally out of scope for this version.
- Current focus is live auth, roster import/sync, and full fighter CRUD workflows.

---

## 🛠 Technologies Used

- React Native
- Axios
- React Navigation

---

## ⚙️ Setup & Installation

```bash
git clone https://github.com/Icepikd3v/ufc-mobile.git
cd ufc-mobile
npm install

## Run the App
npm start

## iOS simulator (Mac Only)
npm run ios

🌐 API Integration

This app connects to the UFC API Backend

Base URL:
https://ufc-api-demo-e18d3cbd0a55.herokuapp.com/

## API Endpoints:
GET     /fighters         → Get all fighters
POST    /fighters         → Add new fighter
PATCH   /fighters/:id     → Update fighter
DELETE  /fighters/:id     → Delete fighter

## File Structure:
ufc-mobile/
├── assets/
├── src/
│   └── screens/
│       ├── HomeScreen.js
│       ├── FightersListScreen.js
│       ├── AddFighterScreen.js
│       ├── UpdateFighterScreen.js
│       └── FighterDetailScreen.js
├── App.js
├── app.json
├── babel.config.js
└── package.json



⸻

🎨 Styling

Dark theme with blue accents:
	•	Primary Blue: #1E88E5
	•	Light Blue: #BBDEFB
	•	Background: #121212
	•	Text: #E0E0E0

⸻

🤝 Contributing

Pull requests welcome. Open an issue to discuss what you’d like to change.

📄 License

MIT License © 2025 Samuel Farmer




```
