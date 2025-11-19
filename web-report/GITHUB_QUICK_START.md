# Quick Start: Make GitHub Run Your Workflow

## Step 1: Push the Workflow File to GitHub

The workflow file is already created at `.github/workflows/deploy.yml`. You need to push it to GitHub:

```powershell
cd C:\Users\xwmarc\Desktop\AI-test

# Make sure you're in the repo
git status

# Add the workflow file (if not already added)
git add .github/workflows/deploy.yml

# Also add the web-report folder and other files
git add web-report/
git add scripts/
git add data/

# Commit
git commit -m "Add GitHub Pages deployment workflow"

# Push to GitHub
git push
```

## Step 2: Enable GitHub Pages

1. Go to your repository: `https://github.com/marcusweiss/svenskatrender`
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Source**, select:
   - **Source**: `GitHub Actions` (NOT "Deploy from a branch")
5. Click **Save**

## Step 3: Trigger the Workflow

The workflow will run automatically when you push. But if you want to trigger it manually:

1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** (on the left)
3. Click **Run workflow** button (top right)
4. Select branch: `main`
5. Click **Run workflow**

## Step 4: Watch It Build

1. Go to **Actions** tab
2. You'll see "Deploy to GitHub Pages" running
3. Click on it to see the build progress
4. Wait 2-3 minutes for it to complete

## Step 5: Your Site is Live!

Once the workflow completes (green checkmark), your site will be at:
```
https://marcusweiss.github.io/svenskatrender/
```

## Troubleshooting

### If you don't see the workflow in Actions:

1. **Check if the file was pushed:**
   ```powershell
   git ls-files .github/workflows/deploy.yml
   ```
   If it shows the file, it's tracked. If not, add it:
   ```powershell
   git add .github/workflows/deploy.yml
   git commit -m "Add workflow"
   git push
   ```

2. **Refresh the Actions page** - Sometimes GitHub needs a moment to detect new workflows

### If the workflow fails:

1. Click on the failed workflow run
2. Click on the failed job (usually "build")
3. Expand the failed step to see the error
4. Common issues:
   - Missing `package-lock.json` → Run `npm install` in `web-report/` folder, then commit and push
   - Wrong file paths → Check that your repo structure matches what the workflow expects

### If Pages shows "No deployments yet":

1. Make sure you selected **GitHub Actions** as the source (not "Deploy from a branch")
2. Wait for the workflow to complete successfully
3. Refresh the Pages settings page

## Quick Commands Summary

```powershell
# Navigate to project
cd C:\Users\xwmarc\Desktop\AI-test

# Check status
git status

# Add everything (including workflow)
git add .

# Commit
git commit -m "Initial setup with GitHub Pages workflow"

# Push
git push
```

Then enable GitHub Pages in Settings → Pages → Source: GitHub Actions

