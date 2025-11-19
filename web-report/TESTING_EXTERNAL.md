# Testing with External Users

## Current Setup (Local Network Only)
The current setup with `--host` flag only allows access from your **local network** (same WiFi/router). The IP `10.240.140.14` is a private IP and won't work from outside your network.

## Option 1: Use ngrok (Easiest for Quick Testing)

### Setup:
1. Download ngrok from: https://ngrok.com/download
2. Extract and run:
   ```powershell
   # Start your dev server first
   cd C:\Users\xwmarc\Desktop\AI-test\web-report
   & "C:\Program Files\nodejs\npm.cmd" run dev -- --host
   
   # In a new terminal, start ngrok
   ngrok http 5173
   ```

3. ngrok will give you a public URL like: `https://abc123.ngrok.io`
4. Share this URL with others (it works from anywhere)

**Note:** Free ngrok URLs change each time you restart it.

## Option 2: Deploy to Your Website (Permanent Solution)

This is the best option for permanent access. Follow the deployment guide to upload to `som-institutet.se/svenskatrender/`

## Option 3: Use localtunnel (Alternative)

```powershell
# Install once
npx localtunnel --help

# Start your dev server
cd web-report
& "C:\Program Files\nodejs\npm.cmd" run dev -- --host

# In another terminal, create tunnel
npx localtunnel --port 5173
```

## Security Note
When sharing with external users, be aware that:
- They can see your dev server
- The connection may not be encrypted (unless using ngrok HTTPS)
- For production, always deploy to your proper website

