# 📱 Capacitor Mobile App Setup Guide

## PriceScan ko Android/iOS App banao

---

## Prerequisites

```bash
# Node.js 18+ hona chahiye
node --version

# Android ke liye:
# Android Studio install karo → https://developer.android.com/studio

# iOS ke liye (Mac only):
# Xcode install karo → App Store
```

---

## Step 1 — Dependencies Install karo

```bash
cd client
npm install
```

---

## Step 2 — Production API URL set karo

`client/src/services/api.js` mein apna server URL daalo:

```javascript
const api = axios.create({
  baseURL: "https://YOUR_SERVER_URL/api"  // ← apna URL yahan daalo
});
```

---

## Step 3 — Build karo

```bash
cd client
npm run build
```

---

## Step 4 — Android App

```bash
# Pehli baar:
npm run cap:add:android

# Sync karo:
npm run cap:sync

# Android Studio mein open karo:
npm run cap:open:android
```

Android Studio mein:
1. Wait karo Gradle sync ke liye
2. `Run ▶` button dabao
3. Emulator ya real phone select karo

---

## Step 5 — iOS App (Mac only)

```bash
# Pehli baar:
npm run cap:add:ios

# Sync karo:
npm run cap:sync

# Xcode mein open karo:
npm run cap:open:ios
```

Xcode mein:
1. Signing & Capabilities → Apple ID se sign in karo
2. `Run ▶` button dabao

---

## Development Mode (Hot reload with phone)

1. Phone aur computer ko same WiFi se connect karo
2. Computer ka IP pata karo (e.g. `192.168.1.5`)
3. `capacitor.config.ts` mein uncomment karo:
   ```typescript
   server: {
     url: "http://192.168.1.5:5173",
     cleartext: true,
   }
   ```
4. `npm run dev` chalao
5. `npx cap sync` karo
6. App ko phone pe run karo

---

## App Features

| Feature | Status |
|---------|--------|
| Camera (Visual Scanner) | ✅ Native camera |
| Haptic Feedback | ✅ Touch feedback |
| Status Bar | ✅ Custom color |
| Splash Screen | ✅ Purple branded |
| Offline Detection | ✅ Error messages |
| Safe Area Support | ✅ Notch/island |

---

## Build Sizes (Approximate)

- Android APK: ~8-12 MB
- iOS IPA: ~10-15 MB

---

## Common Issues

**"SDK not found"** → Android Studio mein SDK install karo
**"No devices"** → Phone mein USB Debugging enable karo
**"Build failed"** → `npx cap sync` dobara chalao
**API not working** → Server URL check karo in api.js
