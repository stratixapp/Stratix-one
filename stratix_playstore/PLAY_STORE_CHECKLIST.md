# Stratix One — Play Store Launch Checklist

## ✅ Already Done (in this build)
- [x] External manifest.json with correct PWA fields
- [x] Service worker (sw.js) with offline caching
- [x] WebView-aware Google Sign-In (redirect in WebView, popup in browser)
- [x] getRedirectResult handler on page load
- [x] Anonymous sign-in for "Continue without account" users
- [x] Privacy Policy + Terms of Service pages
- [x] 192x192 and 512x512 icons
- [x] Honest copy (no misleading "End-to-End Encrypted" claims)
- [x] .well-known/assetlinks.json file (needs your SHA256 fingerprint)

---

## 🔴 YOU MUST DO BEFORE SUBMITTING

### 1. Firebase Console — Add Authorized Domain
Go to: Firebase Console → strtix-one → Authentication → Settings → Authorized Domains
Add: `stratixapp.github.io`

### 2. Firebase Console — Enable Google Sign-In
Go to: Firebase Console → strtix-one → Authentication → Sign-in method
Enable: Google (set support email)

### 3. Get Your SHA256 Fingerprint for assetlinks.json
After building your TWA APK with Bubblewrap:
- Run: `keytool -list -v -keystore your-keystore.jks`
- Copy the SHA-256 fingerprint
- Replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` in `.well-known/assetlinks.json`
- Deploy this file to: `https://stratixapp.github.io/Stratix-one/.well-known/assetlinks.json`

### 4. Build TWA with Bubblewrap
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest=https://stratixapp.github.io/Stratix-one/manifest.json
bubblewrap build
```
Use package name: `com.stratixapp.one`

### 5. Host this build on GitHub Pages
Push all files including `.well-known/assetlinks.json` to your repo.
GitHub Pages must be set to serve from root `/` of main branch.

### 6. Play Store Listing
- App name: Stratix One
- Category: Business / Finance
- Content rating: Everyone
- Privacy policy URL: https://stratixapp.github.io/Stratix-one/privacy.html

---

## 🟡 OPTIONAL BUT RECOMMENDED
- Replace icon-192.png and icon-512.png with higher quality PNG icons
- Add screenshots of the app for Play Store listing (at least 2)
- Set up Firebase App Check to prevent abuse
