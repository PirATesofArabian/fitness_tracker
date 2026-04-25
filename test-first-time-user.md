# Testing First-Time User Flow

## Current Behavior:
- If you have body composition data with height, age, gender → Shows Goal Selector ✓
- If you DON'T have this data → Shows Body Composition Form ✓

## To Test First-Time User Experience:

### Option 1: Clear LocalStorage (Recommended for testing)
1. Open browser DevTools (F12 or Right-click → Inspect)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click "Local Storage" in left sidebar
4. Click on your site URL
5. Right-click → "Clear" or click the 🗑️ icon
6. Refresh the page (F5)
7. Click "Set Profile" → Should now show Body Composition Form!

### Option 2: Check Console Log
1. Open browser console (F12)
2. Click "Set Profile"
3. Look for log message showing:
   - hasBodyCompData: true/false
   - willShow: "Goal Selector" or "Body Composition Form"

## Expected Flow for First-Time Users:
1. Click "Set Profile" → Opens Body Composition Form
2. See welcome message: "👋 Welcome! Let's set up your profile"
3. Fill in required fields (weight, body fat, height, age, gender)
4. Click Save
5. Automatically opens Goal Selector
6. Choose fitness goal and activity level
7. Done! Profile is set up

## Expected Flow for Existing Users:
1. Click "Set Profile" → Opens Goal Selector directly
2. Can change fitness goal and activity level
3. Profile data is read-only (update via Body Composition log)
