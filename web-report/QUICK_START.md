# Quick Start Guide

## For Testing (Share with Others)

### Option 1: Local Network Access
```powershell
cd web-report
& "C:\Program Files\nodejs\npm.cmd" run dev -- --host
```
Then share: `http://YOUR_IP:5173` (find your IP with `ipconfig`)

### Option 2: Build and Preview
```powershell
cd web-report
& "C:\Program Files\nodejs\npm.cmd" run build
& "C:\Program Files\nodejs\npm.cmd" run preview -- --host
```

## For Deployment to som-institutet.se/svenskatrender

### Step 1: Build
```powershell
cd C:\Users\xwmarc\Desktop\AI-test\web-report
& "C:\Program Files\nodejs\npm.cmd" run build
```

### Step 2: Upload
Upload **ALL files** from `web-report/dist/` to:
```
som-institutet.se/svenskatrender/
```

**Important:** Upload the files directly, not the `dist` folder itself.

### Step 3: Verify
Visit: `https://som-institutet.se/svenskatrender/`

## When Updating Data

1. Update Excel file
2. Run: `python scripts/export_report_data.py`
3. Copy: `Copy-Item data\report-data.json web-report\public\data\report-data.json -Force`
4. Build: `cd web-report; & "C:\Program Files\nodejs\npm.cmd" run build`
5. Upload: Replace `svenskatrender/data/report-data.json` on server

