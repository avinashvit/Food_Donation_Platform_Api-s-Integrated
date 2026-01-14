// migrate-to-firebase.js
console.log("=== MIGRATION SCRIPT: Moving data from db.json to Firebase ===");

const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Read your old db.json file
const dbFilePath = './db.json'; // Adjust path if needed

async function migrateData() {
  try {
    // 1. Read db.json
    const rawData = fs.readFileSync(dbFilePath);
    const data = JSON.parse(rawData);
    
    console.log('📖 Read db.json successfully');
    console.log(`Found ${data.users?.length || 0} users`);
    console.log(`Found ${data.donations?.length || 0} donations`);
    console.log(`Found ${data.orders?.length || 0} orders`);

    // 2. Migrate Users
    if (data.users && data.users.length > 0) {
      console.log('\n👤 Migrating users...');
      for (const user of data.users) {
        await db.collection('users').doc(user.sub).set({
          role: user.role
        });
        console.log(`  ✅ Migrated user: ${user.sub} (${user.role})`);
      }
    }

    // 3. Migrate Donations
    if (data.donations && data.donations.length > 0) {
      console.log('\n🍕 Migrating donations...');
      for (const donation of data.donations) {
        // Remove the old 'id' field, let Firebase generate new ones
        const { id, ...donationData } = donation;
        
        // Add createdAt timestamp if it doesn't exist
        if (!donationData.createdAt) {
          donationData.createdAt = admin.firestore.Timestamp.now();
        }
        
        const docRef = await db.collection('donations').add(donationData);
        console.log(`  ✅ Migrated donation: ${donation.foodName} (New ID: ${docRef.id})`);
      }
    }

    // 4. Migrate Orders
    if (data.orders && data.orders.length > 0) {
      console.log('\n📦 Migrating orders...');
      for (const order of data.orders) {
        const { id, ...orderData } = order;
        
        // Convert timestamp string to Firestore timestamp if needed
        if (orderData.timestamp && typeof orderData.timestamp === 'string') {
          orderData.timestamp = admin.firestore.Timestamp.fromDate(new Date(orderData.timestamp));
        }
        
        const docRef = await db.collection('orders').add(orderData);
        console.log(`  ✅ Migrated order: ${docRef.id}`);
      }
    }

    console.log('\n🎉 ✨ MIGRATION COMPLETE! ✨ 🎉');
    console.log('Your data is now in Firebase Firestore!');
    console.log('You can now use your React app with the Firebase backend.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Exit the script
    process.exit();
  }
}

// Run the migration
migrateData();