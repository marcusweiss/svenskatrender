# Feedback Items to Fix

## Priority List

### 1. **Missing Logos (Header & Footer)**
   - **Issue:** Logos were added but are missing/not showing up
   - **Why:** Likely not included in GitHub deployment (missing from `public/` folder or build)
   - **Fix needed:** 
     - Verify logo files are in `web-report/public/`
     - Ensure they're referenced correctly in code
     - Check build process includes them

### 2. **Add Line Labels to Chart Endpoints**
   - **Current:** Endpoints show just the percentage (e.g., "60%")
   - **Requested:** Show percentage + label (e.g., "60% Försämrats")
   - **Fix needed:** Update chart `LabelList` to include series name/label

### 3. **Sidebar Title Updates**
   - **Current:** Shows "Samhällsrapport" and "Svenska Trender 1986-2024" (duplicate)
   - **Requested:** 
     - Replace "Samhällsrapport" with "Svenska Trender 1986-2024"
     - Remove the upper "Svenska Trender 1986-2024" (duplicate)
   - **Fix needed:** Update sidebar header text

### 4. **Search Placeholder Text**
   - **Current:** "Sök indikator..."
   - **Requested:** "Sök fråga..."
   - **Fix needed:** Update placeholder text in search input

### 5. **Color Scheme - All White**
   - **Current:** White and grey used interchangeably
   - **Requested:** Make everything white (remove grey)
   - **Fix needed:** Update CSS color scheme throughout

### 6. **Straight Lines in Charts**
   - **Current:** Lines have a wave/curve
   - **Requested:** Make lines completely straight (linear interpolation)
   - **Fix needed:** Change Recharts line type from default (smooth) to linear

### 7. **Footer Redesign**
   - **Current:** Footer structure unknown
   - **Requested:** 
     - Left side: "Kommentar" as a box
     - Right side: "Fråga" and "Källa" 
     - "Källa" should come from "Källa:" row in the Excel document
   - **Fix needed:** 
     - Extract "Källa" from Excel metadata
     - Redesign footer layout
     - Add "Kommentar" display (from Excel metadata)

---

## Files That Will Need Changes

1. **`scripts/export_report_data.py`**
   - Extract "Källa" metadata from Excel
   - Possibly extract "Kommentar" if not already done

2. **`web-report/src/App.tsx`**
   - Update sidebar title
   - Update search placeholder
   - Update chart labels (add series name)
   - Update footer layout and content
   - Change line type to linear

3. **`web-report/src/App.css`**
   - Update color scheme (remove grey, make all white)
   - Update footer styling

4. **`web-report/public/`**
   - Verify logo files are present
   - Ensure they're properly named

---

## Notes

- **Image reference:** User provided an image showing the footer layout with "Kommentar" on left, "Fråga" and "Källa" on right
- **Data source:** "Källa" should come from the "Källa:" row in the Excel document
- **Line labels:** Need to match series names to their labels (e.g., "Försämrats", "Förbättrats", etc.)

