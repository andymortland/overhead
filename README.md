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

## OpenSky Network account

This app requires a free OpenSky Network account to function reliably.

**Why?** OpenSky's anonymous API is rate-limited to a shared pool of ~400 requests/day
across all anonymous users worldwide. With a free account you get your own personal
allocation, which is enough for several hours of continuous use per day.

**Create a free account:**
1. Go to https://opensky-network.org
2. Click Register and complete signup (no credit card required)
3. Launch the app - the login screen will appear on first use
4. Enter your OpenSky username and password and tap CONNECT
5. The app verifies your credentials, saves them to the device, and proceeds

Your credentials are stored only in your browser's local storage on your device.
They are never transmitted to GitHub or any third party - the app connects directly
from your device to OpenSky's API.

**Subsequent launches:** the app remembers your credentials automatically. Use the
⚙ button in the header if you ever need to update them.

## Notes

- **Coverage**: OpenSky relies on a global network of volunteer ADS-B receivers.
  The Chicago metro area has excellent coverage.
- **Rate limits**: at a 30-second refresh interval, a free account supports roughly
  3-4 hours of continuous use per day. The app retries automatically if a limit is hit.
- **Offline**: the app shell loads from cache when offline, but live plane data requires
  a network connection.
