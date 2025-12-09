# How to Run the Tool Locally

## Quick Start (3 Steps)

### Step 1: Export the Data
First, make sure your data is exported from Excel:

```powershell
cd C:\Users\xwmarc\Desktop\AI-test
python scripts/export_report_data.py
```

This creates/updates `data/report-data.json` with your latest Excel data.

### Step 2: Start the Development Server
Open PowerShell and run:

```powershell
cd C:\Users\xwmarc\Desktop\AI-test\web-report
& "C:\Program Files\nodejs\npm.cmd" run dev
```

### Step 3: Open in Browser
The terminal will show a URL like:
```
➜  Local:   http://localhost:5173/svenskatrender/
```

**Click that URL** or copy it into your browser.

---

## What You'll See

- ✅ The tool running in your browser
- ✅ Any changes you make will automatically refresh
- ✅ You can test all functionality

---

## Making Changes

1. **Edit files** in `web-report/src/` (like `App.tsx`, `App.css`)
2. **Save the file**
3. **Browser automatically refreshes** with your changes
4. **No need to restart** the server

---

## Stopping the Server

Press `Ctrl + C` in the terminal where the server is running.

---

## If Something Goes Wrong

### "Cannot find module" or similar errors:
```powershell
cd C:\Users\xwmarc\Desktop\AI-test\web-report
& "C:\Program Files\nodejs\npm.cmd" install
```

### Data not showing:
- Make sure you ran Step 1 (export script) first
- Check that `data/report-data.json` exists

### Port already in use:
- Close other terminals running the dev server
- Or the server will automatically use a different port

---

## Ready to Make Updates!

Once the tool is running locally, you can:
- ✅ See your changes immediately
- ✅ Test functionality
- ✅ Fix issues
- ✅ Then deploy when ready

