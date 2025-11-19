# Deployment Guide for Svenska Trender Web Report

## 1. Testing Locally (Allow Others to Test)

### Option A: Share on Local Network
1. Find your computer's local IP address:
   - Open PowerShell and run: `ipconfig`
   - Look for "IPv4 Address" (usually something like `192.168.1.xxx`)

2. Start the dev server with network access:
   ```powershell
   cd web-report
   & "C:\Program Files\nodejs\npm.cmd" run dev -- --host
   ```

3. Share the URL with others:
   - Your URL will be: `http://YOUR_IP_ADDRESS:5173`
   - Example: `http://192.168.1.100:5173`
   - Others on the same network can access it using this URL

### Option B: Build and Preview
1. Build the production version:
   ```powershell
   cd web-report
   & "C:\Program Files\nodejs\npm.cmd" run build
   ```

2. Preview the build:
   ```powershell
   & "C:\Program Files\nodejs\npm.cmd" run preview -- --host
   ```

3. Share the preview URL (same format as Option A)

## 2. Deploying to som-institutet.se/svenskatrender

### Step 1: Build the Production Version

```powershell
cd web-report
& "C:\Program Files\nodejs\npm.cmd" run build
```

This creates a `dist` folder with all the production files.

### Step 2: Prepare Files for Upload

The `dist` folder contains everything you need:
- `index.html` - Main HTML file
- `assets/` - JavaScript and CSS files
- `data/report-data.json` - Your report data
- `footer.jpg` - Footer logo
- `SOM_Huvud_CMYK_GUright.jpg` - Header logo

### Step 3: Upload to Your Web Server

You have several options depending on your hosting setup:

#### Option A: FTP/SFTP Upload
1. Connect to your web server using an FTP client (FileZilla, WinSCP, etc.)
2. Navigate to your website's root directory
3. Create a folder called `svenskatrender` (if it doesn't exist)
4. Upload ALL contents from the `dist` folder to `svenskatrender/`
   - Make sure to upload files, not the `dist` folder itself
   - The structure should be: `som-institutet.se/svenskatrender/index.html`

#### Option B: cPanel File Manager
1. Log into your cPanel
2. Open File Manager
3. Navigate to `public_html` (or your website root)
4. Create a new folder: `svenskatrender`
5. Upload all files from the `dist` folder to `svenskatrender/`

#### Option C: SSH/Command Line
If you have SSH access:
```bash
# Navigate to your website directory
cd /path/to/your/website

# Create the directory
mkdir -p svenskatrender

# Upload files (using scp, rsync, or your preferred method)
# Example with scp:
scp -r dist/* user@your-server:/path/to/website/svenskatrender/
```

### Step 4: Verify Deployment

1. Visit: `https://som-institutet.se/svenskatrender/`
2. Check that:
   - The page loads correctly
   - The header logo appears
   - The footer logo appears
   - Charts and tables display properly
   - Data loads correctly

### Step 5: Update Data (When You Get New Yearly Data)

When you need to update the report with new data:

1. **Update the Excel file** with new data
2. **Re-export the data:**
   ```powershell
   cd C:\Users\xwmarc\Desktop\AI-test
   python scripts/export_report_data.py
   ```
3. **Copy the updated JSON:**
   ```powershell
   Copy-Item -Path "data\report-data.json" -Destination "web-report\public\data\report-data.json" -Force
   ```
4. **Rebuild:**
   ```powershell
   cd web-report
   & "C:\Program Files\nodejs\npm.cmd" run build
   ```
5. **Upload only the updated files:**
   - Upload `dist/data/report-data.json` to replace the old one
   - Or upload the entire `dist` folder contents again

## Troubleshooting

### If the page shows a blank screen:
- Check browser console (F12) for errors
- Verify all files were uploaded correctly
- Check that `index.html` is in the `svenskatrender` folder (not a subfolder)

### If images don't load:
- Verify `footer.jpg` and `SOM_Huvud_CMYK_GUright.jpg` are in the `svenskatrender` folder
- Check file paths are correct (case-sensitive on Linux servers)

### If data doesn't load:
- Verify `data/report-data.json` is in `svenskatrender/data/`
- Check browser console for 404 errors
- Ensure the JSON file is accessible (not blocked by server settings)

### If paths are wrong:
- The Vite config is set to `base: '/svenskatrender/'`
- If your server structure is different, you may need to adjust this in `vite.config.ts`

## Quick Reference

**Build command:**
```powershell
cd web-report
npm run build
```

**Output folder:**
```
web-report/dist/
```

**Upload to:**
```
som-institutet.se/svenskatrender/
```

**Files to upload:**
- Everything inside `dist/` folder
- Keep the folder structure intact

