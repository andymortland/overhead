# OVERHEAD - ADS-B Airspace Monitor PWA

A live radar display showing all aircraft within 50nm of your location.
Installable as a home screen app on iPhone via Safari.

---

## Deploy to GitHub Pages (free, ~10 minutes)

### Step 1 - Create a GitHub account
Go to https://github.com and sign up if you don't have one.

### Step 2 - Create a new repository
1. Click the "+" icon top-right > "New repository"
2. Name it: `overhead`
3. Set it to **Public**
4. Click "Create repository"

### Step 3 - Upload the files
1. On your new repo page, click "uploading an existing file"
2. Drag all 6 files into the upload area:
   - index.html
   - manifest.json
   - sw.js
   - icon-192.svg
   - icon-512.svg
   - README.md
3. Click "Commit changes"

### Step 4 - Enable GitHub Pages
1. Go to your repo's **Settings** tab
2. Click **Pages** in the left sidebar
3. Under "Branch", select **main** and click Save
4. Wait ~60 seconds, then your app is live at:
   `https://YOUR-GITHUB-USERNAME.github.io/overhead`

---

## Install on iPhone

1. Open the URL above in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button (box with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap "Add"

The app now lives on your home screen, launches full-screen with no browser chrome,
and works anywhere you have a cell signal.

---

## Using the app

- Tap **ACQUIRE POSITION** and allow location access when prompted
- Green dots on the radar = aircraft within 50nm, positioned by real bearing and distance
- Tap any dot or row in the list to see altitude, speed, heading, and vertical rate
- Data refreshes every 30 seconds from OpenSky Network

## Notes

- **OpenSky rate limits**: the free anonymous API allows ~400 requests/day shared across
  all anonymous users. If you hit the limit, the app shows "API LIMIT" and retries in 30s.
  Creating a free account at opensky-network.org and adding credentials to the fetch URL
  gives much better reliability.
- **Coverage**: OpenSky relies on volunteer ADS-B receivers. Chicago metro area has
  excellent coverage.
- **Offline**: the app shell loads from cache when offline, but live plane data requires
  a network connection.
