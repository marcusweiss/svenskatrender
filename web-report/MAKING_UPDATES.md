# Making Updates to Your Web Report

## Quick Workflow

When you want to make changes (design, data, features):

### Step 1: Make Your Changes Locally

Edit files in your project:
- `web-report/src/App.tsx` - Main app code
- `web-report/src/App.css` - Styling
- `data/report-data.json` - Update data (or run the export script)

### Step 2: Test Locally (Optional but Recommended)

```powershell
cd C:\Users\xwmarc\Desktop\AI-test\web-report
& "C:\Program Files\nodejs\npm.cmd" run dev
```

Visit `http://localhost:5173/svenskatrender/` to see your changes.

### Step 3: Commit and Push

```powershell
cd C:\Users\xwmarc\Desktop\AI-test

# See what changed
git status

# Add your changes
git add .

# Commit with a descriptive message
git commit -m "Update: [describe your changes]"

# Push to GitHub
git push
```

### Step 4: GitHub Automatically Deploys

- GitHub Actions will automatically:
  1. Build your site
  2. Deploy to GitHub Pages
  3. Make it live in 2-3 minutes

- Check progress: Go to **Actions** tab in your GitHub repo
- Your site updates automatically at: `https://marcusweiss.github.io/svenskatrender/`

## Common Update Scenarios

### Updating Data (New Year's Data)

```powershell
# 1. Update your Excel file or data
# 2. Export the data
python scripts/export_report_data.py

# 3. Copy to web-report
Copy-Item data\report-data.json web-report\public\data\report-data.json -Force

# 4. Commit and push
git add .
git commit -m "Update data for 2025"
git push
```

### Changing Colors/Styles

```powershell
# 1. Edit web-report/src/App.css
# 2. Test locally: npm run dev
# 3. Commit and push
git add web-report/src/App.css
git commit -m "Update color scheme"
git push
```

### Adding New Features

```powershell
# 1. Edit web-report/src/App.tsx
# 2. Test locally: npm run dev
# 3. Commit and push
git add web-report/src/App.tsx
git commit -m "Add new feature: [description]"
git push
```

## Workflow Summary

```
1. Edit files locally
   ↓
2. Test (optional): npm run dev
   ↓
3. git add .
   ↓
4. git commit -m "Description"
   ↓
5. git push
   ↓
6. Wait 2-3 minutes
   ↓
7. Changes are live! 🎉
```

## Tips

- **Always test locally first** if making big changes
- **Use descriptive commit messages** so you can track changes
- **Check the Actions tab** if something doesn't work
- **Your local files are safe** - pushing doesn't delete anything

## Rollback (If Something Goes Wrong)

If you need to undo a change:

```powershell
# See your commit history
git log

# Revert to a previous commit (replace COMMIT_HASH)
git revert COMMIT_HASH

# Or reset to a previous commit (⚠️ use carefully)
git reset --hard COMMIT_HASH
git push --force
```

## That's It!

GitHub Pages makes updates super easy - just push your changes and they go live automatically. No manual uploads, no FTP, no complicated deployment steps.

