# Web Hosting Explained - Simple Guide

## Is It Safe? ✅ YES!

**What you're uploading:**
- Just **static files** (HTML, CSS, JavaScript, images, data)
- No server-side code that could be hacked
- No connection back to your local machine
- No access to your computer's files

**Think of it like:**
- Uploading a PDF to a website - it's just a file that others can view
- Your local computer is completely separate and safe

## What Happens When You Upload?

### Your Local Machine:
- ✅ Stays completely safe and unchanged
- ✅ No connection to the website
- ✅ Your source code stays on your computer
- ✅ You can continue working normally

### The Web Server:
- Receives a **copy** of your built files
- Stores them in a folder: `som-institutet.se/svenskatrender/`
- Serves them to visitors when they visit the URL
- That's it - nothing more!

## What Gets Uploaded?

**Only these files from `web-report/dist/`:**
- `index.html` - The main page
- `assets/` - JavaScript and CSS (already minified/compiled)
- `data/report-data.json` - Your report data
- `footer.jpg` - Footer logo
- `SOM_Huvud_CMYK_GUright.jpg` - Header logo

**What does NOT get uploaded:**
- ❌ Your source code (`src/` folder)
- ❌ Your Excel file
- ❌ Your Python scripts
- ❌ Your local computer files
- ❌ Any personal information

## Security Considerations

### ✅ Safe Because:
1. **Static files only** - No server-side code that can be exploited
2. **Read-only data** - The JSON file is just data, not executable code
3. **No database** - Nothing to hack into
4. **No user input** - No forms or data submission
5. **Standard web files** - Same type of files as any normal website

### 🔒 Best Practices:
1. **Keep your source code private** - Only upload the `dist/` folder
2. **Regular updates** - When you update data, just replace the JSON file
3. **Backup** - Keep a copy of your `dist/` folder before uploading

## How Web Hosting Works (Simple Explanation)

```
Your Computer                    Web Server                    Visitors
     │                               │                            │
     │ 1. Build files                │                            │
     │    (creates dist/)            │                            │
     │                               │                            │
     │ 2. Upload files ─────────────>│                            │
     │    (copy to server)           │                            │
     │                               │                            │
     │                               │ 3. Store files             │
     │                               │    in folder               │
     │                               │                            │
     │                               │<─────────── 4. Request page│
     │                               │                            │
     │                               │────────────> 5. Send files │
     │                               │                            │
```

**Key Points:**
- Uploading is just **copying files** to a server
- The server **stores** them and **sends** them to visitors
- Your computer is **not involved** after uploading
- No ongoing connection between your computer and the website

## Step-by-Step: What Happens

1. **You build:** Creates optimized files in `dist/` folder
2. **You upload:** Copy files to your web server (via FTP/cPanel/etc.)
3. **Server stores:** Files sit in `svenskatrender/` folder on server
4. **Visitor requests:** Types `som-institutet.se/svenskatrender/` in browser
5. **Server responds:** Sends the files to visitor's browser
6. **Browser displays:** Visitor sees your report

**Your computer's role:** Only step 1 and 2. After that, the server handles everything.

## Common Concerns - Answered

**Q: Can hackers access my local computer through the website?**  
A: No. The website is just files on a server. No connection to your computer.

**Q: Will uploading affect my local files?**  
A: No. You're copying files, not moving them. Your originals stay safe.

**Q: Can someone see my source code?**  
A: No. Only the compiled/built files are uploaded. Source code stays on your computer.

**Q: Is the data file secure?**  
A: Yes. It's just JSON data (numbers and text). No sensitive information, and it's read-only.

**Q: What if I make a mistake?**  
A: You can always re-upload or delete files. Your local files are safe.

## What You Need to Upload

**Location on your computer:**
```
C:\Users\xwmarc\Desktop\AI-test\web-report\dist\
```

**Upload to:**
```
som-institutet.se/svenskatrender/
```

**Files to upload:**
- Everything inside `dist/` folder
- Keep the folder structure (assets/, data/, etc.)

## After Uploading

✅ Website works independently  
✅ No connection to your computer  
✅ You can turn off your computer - website still works  
✅ Others can access it anytime  
✅ You can update it anytime by uploading new files  

## Summary

**It's like:**
- Taking a photo, printing it, and putting it in a public gallery
- The photo in the gallery is separate from your camera
- People can see the photo, but can't access your camera
- You can update the photo anytime by replacing it

**Your website files are the same:**
- Separate from your computer
- Safe to share publicly
- Easy to update
- No risk to your local files

