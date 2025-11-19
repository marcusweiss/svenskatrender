# Testing with ngrok - Step by Step Guide

## What is ngrok?
ngrok creates a secure tunnel from the internet to your local dev server, so others can access it even if they're not on your network.

## Quick Start (Easiest Method)

### Option A: Use the Helper Script

1. **Download ngrok:**
   - Go to: https://ngrok.com/download
   - Download Windows version
   - Extract `ngrok.exe` to the `web-report` folder

2. **Run the script:**
   ```powershell
   cd C:\Users\xwmarc\Desktop\AI-test\web-report
   .\start-with-ngrok.ps1
   ```

3. **Get your URL:**
   - ngrok will show a URL like: `https://abc123-def456.ngrok-free.app`
   - Your full URL is: `https://abc123-def456.ngrok-free.app/svenskatrender/`

### Option B: Manual Setup

## Step 1: Download ngrok

1. Go to: https://ngrok.com/download
2. Download the Windows version
3. Extract the ZIP file (you'll get `ngrok.exe`)
4. Place it somewhere easy to find (Desktop or add to PATH)

## Step 2: Start Your Dev Server

Open PowerShell and run:
```powershell
cd C:\Users\xwmarc\Desktop\AI-test\web-report
& "C:\Program Files\nodejs\npm.cmd" run dev
```

Wait until you see: `Local: http://localhost:5173/`

**Keep this terminal open!**

## Step 3: Start ngrok

Open a **NEW** PowerShell window and run:

**If ngrok.exe is in the web-report folder:**
```powershell
cd C:\Users\xwmarc\Desktop\AI-test\web-report
.\ngrok.exe http 5173
```

**If ngrok.exe is on your Desktop:**
```powershell
cd C:\Users\xwmarc\Desktop
.\ngrok.exe http 5173
```

**If ngrok is in your PATH:**
```powershell
ngrok http 5173
```

## Step 4: Get Your Public URL

ngrok will show something like:
```
Forwarding   https://abc123-def456.ngrok-free.app -> http://localhost:5173
```

**This is your public URL!** Share this with others.

## Step 5: Access Your Site

Visit: `https://abc123-def456.ngrok-free.app/svenskatrender/`

**Important:** Include the `/svenskatrender/` path at the end!

## Troubleshooting

### If ngrok shows "ngrok not found":
- Make sure you're in the folder where `ngrok.exe` is located
- Or add ngrok to your PATH
- Or use the full path: `C:\path\to\ngrok.exe http 5173`

### If the page doesn't load:
- Make sure your dev server is still running (Step 2)
- Check that you're using the `/svenskatrender/` path
- Try the HTTP URL instead of HTTPS (ngrok shows both)

### If you see "This site can't be reached":
- Make sure both terminals are running (dev server + ngrok)
- Check that port 5173 is not blocked by firewall

## Quick Reference

**Terminal 1 (Dev Server):**
```powershell
cd C:\Users\xwmarc\Desktop\AI-test\web-report
& "C:\Program Files\nodejs\npm.cmd" run dev -- --host
```

**Terminal 2 (ngrok):**
```powershell
cd C:\Users\xwmarc\Desktop  # or wherever ngrok.exe is
.\ngrok.exe http 5173
```

**Share this URL:**
```
https://[your-ngrok-url].ngrok-free.app/svenskatrender/
```

## Notes

- **Free ngrok URLs change** each time you restart ngrok
- **Both terminals must stay open** while testing
- **HTTPS is included** (secure connection)
- **Works from anywhere** in the world

## Stopping

- Press `Ctrl+C` in both terminals to stop
- Or just close the terminal windows

