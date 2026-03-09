# 🔥 Firebase Firestore Setup Guide for HimRugs

## 1. FIRESTORE DATABASE STRUCTURE

### Collection Name: `customerRequests`

Each document in this collection contains customer requests. Here's the structure:

```
customerRequests/
├── {documentId1}
│   ├── type: "design" | "message" (string)
│   ├── fullname: "Customer Full Name" (string)
│   ├── contact: "+91XXXXXXXXXX" (string)
│   ├── email: "customer@example.com" (string)
│   ├── address: "Full Address" | "Design Details" (string)
│   ├── message: "Message text" (string - only for type: "message")
│   ├── timestamp: Timestamp (Firestore Timestamp)
│   └── createdAt: "2026-03-09 14:30:45" (string)
└── {documentId2}
    └── ... (more documents)
```

---

## 2. FIRESTORE SECURITY RULES

⚠️ **IMPORTANT**: Copy-paste these rules directly into your Firebase Console

### Go to: Firebase Console → Firestore Database → Rules tab

Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow everyone to read all customer requests (for admin dashboard)
    match /customerRequests/{document=**} {
      allow read: if true;
      allow create: if request.resource.data.fullname != null
        && request.resource.data.contact != null
        && request.resource.data.email != null
        && request.resource.data.timestamp != null
        && (request.resource.data.type == "design" || request.resource.data.type == "message");
      allow update, delete: if false; // Prevent modifications
    }
    
    // Default: Deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### What These Rules Do:
- ✅ **Allow**: Anyone can read all customer requests (for admin dashboard)
- ✅ **Allow**: Anyone can submit new requests (with required fields)
- ❌ **Deny**: No one can modify or delete existing requests
- ❌ **Deny**: No one can access any other collections

---

## 3. HOW TO SET UP FIRESTORE IN FIREBASE CONSOLE

### Step 1: Create Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click on your project "himrugs"
3. Go to **Firestore Database** (left sidebar)
4. Click **Create Database**
5. Choose: **Mumbai (asia-south1)** region (or your preferred region)
6. Choose: **Start in test mode** (then apply rules below)
7. Click **Enable**

### Step 2: Apply Security Rules
1. Click on **Rules** tab
2. Paste the rules code from above (Section 2)
3. Click **Publish**

### Step 3: Verify Collections Auto-Create
- Collections auto-create when data is added
- No manual creation needed

---

## 4. FIELD TYPES REFERENCE

| Field Name | Type | Example | Required |
|-----------|------|---------|----------|
| type | string | "design" or "message" | ✅ Yes |
| fullname | string | "John Doe" | ✅ Yes |
| contact | string | "+919876543210" | ✅ Yes |
| email | string | "john@example.com" | ✅ Yes |
| address | string | "123 Main St, City" | ✅ Yes (for design) |
| message | string | "I want custom rug..." | ✅ Yes (for message) |
| timestamp | Timestamp | Firestore Timestamp | ✅ Yes |
| createdAt | string | "2026-03-09 14:30" | ✅ Yes |

---

## 5. TESTING THE INTEGRATION

### Test 1: Submit a Design Request
1. Open your website
2. Go to the "Custom Rug Request" section
3. Fill the form with test data
4. Click "Send Request"
5. Check Firebase Console → Firestore → customerRequests collection
6. Verify the document was created

### Test 2: Submit a Message
1. Go to Admin Dashboard (`admin-dashboard.html`)
2. Click on "Send a Message" tab
3. Fill the form
4. Click "Send Message"
5. Verify the data appears in the dashboard
6. Check Firebase Console to see the document

### Test 3: View Admin Dashboard
1. Go to `admin-dashboard.html`
2. All submitted requests should appear
3. Filter by "Design Requests" or "Messages"
4. Statistics should update automatically

---

## 6. VIEWING DATA IN FIREBASE CONSOLE

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select "himrugs" project
3. Click **Firestore Database**
4. You'll see `customerRequests` collection
5. Click on documents to view details
6. Real-time updates visible in console

---

## 7. FIRESTORE INDEXES

Firestore auto-creates indexes for your queries. No manual setup needed.

**Auto-created indexes:**
- `timestamp` (descending order)
- `type` (for filtering)

---

## 8. PRICING & QUOTAS (Cloud Firestore Free Tier)

**Free Tier Includes:**
- 50,000 reads per day
- 20,000 writes per day
- 20,000 deletes per day
- 1 GB storage
- Perfect for small to medium websites

---

## 9. BACKUP & EXPORT DATA

### Auto Backup (Google Cloud)
- Firestore automatically backs up your data
- No manual action needed

### Manual Export to CSV
```javascript
// Open browser console on admin dashboard and run:
exportToCSV()
```

---

## 10. COLLECTIONS SUMMARY

| Collection | Purpose | Auto-created |
|-----------|---------|--------------|
| customerRequests | Store all customer requests & messages | ✅ Yes |

---

## 11. TROUBLESHOOTING

### Issue: "Permission denied" when submitting form
**Solution**: 
- Check that security rules are correctly pasted
- Ensure project ID is correct in firebase-config.js
- Wait 1-2 minutes for rules to propagate

### Issue: Data not appearing in admin dashboard
**Solution**:
- Check browser console for errors (F12)
- Verify Firestore is enabled
- Check that documents have correct field names

### Issue: Admin dashboard shows "No requests yet"
**Solution**:
- Refresh the page
- Wait a few seconds for data to load
- Check Firestore console to verify data exists

---

## 12. FILES RELATED TO FIREBASE

1. **js/firebase-config.js** - Firebase configuration & initialization
2. **js/script.js** - Home page form with Firebase
3. **js/admin-dashboard.js** - Admin dashboard with Firebase
4. **admin-dashboard.html** - Admin panel page

---

## 13. QUICK START CHECKLIST

✅ Firebase project created (himrugs)
✅ Firestore database created
✅ Security rules applied
✅ firebase-config.js created with API keys
✅ script.js updated with Firebase integration
✅ admin-dashboard.js updated with Firebase integration
✅ admin-dashboard.html created
✅ Test form submissions

---

## 14. ADDITIONAL FEATURES

### Real-time Updates
The admin dashboard uses Firestore queries with `orderBy` timestamp. Data auto-updates when new requests are submitted.

### Data Filtering
- Filter by "All" requests
- Filter by "Design Requests" only
- Filter by "Messages" only

### Statistics
Real-time statistics show:
- Total requests count
- Design requests count
- Messages count

---

💡 **Need Help?**
- Firebase Docs: https://firebase.google.com/docs/firestore
- JavaScript SDK: https://firebase.google.com/docs/firestore/quickstart
- Rules Documentation: https://firebase.google.com/docs/firestore/security/start

---

**Last Updated:** March 9, 2026
**Firebase SDK Version:** 10.8.0
