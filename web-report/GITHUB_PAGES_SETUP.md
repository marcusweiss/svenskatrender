# GitHub Pages Setup Guide

## ✅ Yes, GitHub Pages Works Perfectly!

GitHub Pages is **free** and perfect for hosting your static React app. It automatically builds and deploys your site whenever you push changes.

## Quick Setup (5 Steps)

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `svenskatrender`)
3. **Don't** initialize with README (we'll push existing code)
4. Click "Create repository"

### Step 2: Push Your Code to GitHub

Open PowerShell in your project folder:

```powershell
cd C:\Users\xwmarc\Desktop\AI-test

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Svenska trender web report"

# Add your GitHub repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/svenskatrender.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source**, select:
   - **Source**: `GitHub Actions`
5. Save

### Step 4: Wait for Deployment

1. GitHub will automatically start building your site
2. Go to **Actions** tab to see the build progress
3. Wait 2-3 minutes for the first build

### Step 5: Access Your Site

Your site will be available at:
```
https://YOUR_USERNAME.github.io/svenskatrender/
```

**Example:** If your username is `som-institutet`, the URL would be:
```
https://som-institutet.github.io/svenskatrender/
```

## Automatic Updates

**Every time you push changes:**
1. GitHub automatically rebuilds your site
2. New version goes live in 2-3 minutes
3. No manual upload needed!

## Updating Your Data

When you have new data:

```powershell
# 1. Update the Excel file and export data
python scripts/export_report_data.py

# 2. Copy the data file
Copy-Item data\report-data.json web-report\public\data\report-data.json -Force

# 3. Commit and push
git add .
git commit -m "Update report data for 2025"
git push
```

GitHub will automatically rebuild and deploy! 🚀

## Custom Domain (Optional)

If you want to use `som-institutet.se/svenskatrender`:

1. In GitHub repository **Settings** → **Pages**
2. Under **Custom domain**, enter: `svenskatrender.som-institutet.se`
3. Follow GitHub's DNS setup instructions
4. Update your DNS records with your domain provider

## Repository Structure

Your repository should look like:
```
svenskatrender/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← Auto-deployment script
├── scripts/
│   └── export_report_data.py
├── data/
│   └── report-data.json
├── web-report/
│   ├── src/
│   ├── public/
│   ├── dist/                   ← Built files (auto-generated)
│   └── package.json
└── README.md
```

## Troubleshooting

### Build Fails

1. Check the **Actions** tab for error messages
2. Common issues:
   - Missing `package-lock.json` → Run `npm install` in `web-report/`
   - Node version mismatch → Check `package.json` for required version

### Site Not Loading

1. Check **Settings** → **Pages** → Source is set to **GitHub Actions**
2. Wait a few minutes after first push
3. Check the **Actions** tab to see if build succeeded

### Wrong Base Path

If your site is at `username.github.io/repo-name`, the base path should be `/repo-name/`.

The `vite.config.ts` already has `base: '/svenskatrender/'` which should work if your repo is named `svenskatrender`.

If your repo has a different name, update `vite.config.ts`:
```typescript
base: '/YOUR_REPO_NAME/',
```

## Advantages of GitHub Pages

✅ **Free** - No cost  
✅ **Automatic** - Builds on every push  
✅ **Fast** - CDN delivery worldwide  
✅ **HTTPS** - Secure by default  
✅ **Easy** - Just push code  
✅ **Reliable** - GitHub infrastructure  

## Privacy Options

- **Public repository** = Public site (anyone can see code and site)
- **Private repository** = Still free, but site is only accessible to you (or you can make it public)

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push your code
3. ✅ Enable GitHub Pages
4. ✅ Share the URL with others!

Your site will be live at: `https://YOUR_USERNAME.github.io/svenskatrender/`

