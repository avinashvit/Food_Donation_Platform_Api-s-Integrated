
console.log("--- I AM THE REAL FIREBASE SERVER ---");

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config(); 
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const nodemailer = require('nodemailer'); 


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();


const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());


const createTransporter = async () => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_REFRESH_TOKEN,
            },
            secure: true, 
        });
        return transporter;
    } catch (error) {
        console.error("Failed to create email transporter. Check .env keys and App Password:", error);
        return null;
    }
};

const sendMail = async (emailOptions) => {
    const transporter = await createTransporter();
    if (transporter) {
        try {
            await transporter.sendMail(emailOptions);
            console.log(`Email successfully queued for ${emailOptions.to}`);
        } catch (error) {
            console.error("Failed to send email via Nodemailer:", error);
        }
    }
};




app.post('/api/users', async (req, res) => {
  try {
    const { sub, role } = req.body;
    if (!sub || !role) {
      return res.status(400).json({ error: 'User ID and role are required.' });
    }
    await db.collection('users').doc(sub).set({ role });
    console.log(`User ${sub} role set to: ${role}`);
    res.status(201).json({ message: 'User role saved successfully.' });
  } catch (error) {
    console.error("Error saving user role:", error);
    res.status(500).json({ error: 'Failed to save user role' });
  }
});

app.get('/api/users/:sub', async (req, res) => {
  try {
    const { sub } = req.params;
    const userDoc = await db.collection('users').doc(sub).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json(userDoc.data());
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});


app.post('/api/donations', async (req, res) => {
  try {
    const { donorId, foodName, category, quantity, location, latitude, longitude, donorPhoneNumber, donorEmail } = req.body;
    if (!foodName || !category || !quantity || !location || !donorPhoneNumber || !donorEmail) {
      return res.status(400).json({ error: 'Missing donation fields' });
    }

    const newDonation = {
      donorId,
      foodName,
      category,
      quantity,
      location,
      latitude,
      longitude,
      donorPhoneNumber,
      donorEmail, 
      status: 'available',
      createdAt: admin.firestore.FieldValue.serverTimestamp() 
    };

    const docRef = await db.collection('donations').add(newDonation);
    console.log(`SUCCESS: New donation added: ${foodName} (ID: ${docRef.id})`);
    
    sendMail({
        from: `"Food Donation Platform" <${process.env.GMAIL_USER}>`,
        to: donorEmail, 
        subject: `✅ Donation Confirmation: ${foodName} Placed Successfully!`,
        html: `<p>Thank you for your generous donation of <strong>${foodName}</strong>. Your item is now available for claim.</p>`
    });

    res.status(201).json({ id: docRef.id, ...newDonation });
  } catch (error) {
    console.error("--- ERROR ADDING DONATION ---:", error);
    res.status(500).json({ error: 'Failed to add donation' });
  }
});

app.get('/api/donations', async (req, res) => {
  try {
    const donations = [];
    const snapshot = await db.collection('donations').where('status', '==', 'available').get();
    
    snapshot.forEach(doc => { donations.push({ id: doc.id, ...doc.data() }); });

    donations.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });

    res.status(200).json(donations);
  } catch (error) {
    console.error("Error getting donations:", error);
    res.status(500).json({ error: 'Failed to get donations' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { recipientId, donationId, recipientEmail } = req.body; 
    const donationRef = db.collection('donations').doc(donationId);
    const donationDoc = await donationRef.get();

    if (!donationDoc.exists) { return res.status(404).json({ error: 'Donation not found.' }); }
    if (donationDoc.data().status !== 'available') { return res.status(400).json({ error: 'Donation is no longer available.' }); }
    
    await donationRef.update({ status: 'claimed' });

    const newOrder = { 
        recipientId, 
        donationId, 
        recipientEmail, 
        timestamp: admin.firestore.FieldValue.serverTimestamp() 
    };
    const orderRef = await db.collection('orders').add(newOrder);
    
    const donation = donationDoc.data();

  
    sendMail({
        from: `"Food Donation Platform" <${process.env.GMAIL_USER}>`,
        to: recipientEmail, 
        subject: `🍽️ CONFIRMED: You have claimed ${donation.foodName}!`,
        html: `<p>You claimed <strong>${donation.foodName}</strong>. Contact the donor (${donation.donorPhoneNumber}) to arrange pickup at: <strong>${donation.location}</strong></p>`
    });
    
    sendMail({
        from: `"Food Donation Platform" <${process.env.GMAIL_USER}>`,
        to: donation.donorEmail, 
        subject: `🎉 CLAIMED: Your donation of ${donation.foodName} has been claimed!`,
        html: `<p>Your donation of <strong>${donation.foodName}</strong> has been successfully claimed by ${recipientEmail}.</p>`
    });
    

    console.log(`SUCCESS: Donation #${donationId} claimed by ${recipientId}`);
    res.status(200).json({ id: orderRef.id, ...newOrder });
  } catch (error) {
    console.error("--- ERROR CREATING ORDER ---:", error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});


app.get('/api/donations/donor/:donorId', async (req, res) => {
    try {
      const { donorId } = req.params;
      const history = [];
      const snapshot = await db.collection('donations').where('donorId', '==', donorId).get();
      
      snapshot.forEach(doc => { history.push({ id: doc.id, ...doc.data() }); });

      history.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
      });

      res.status(200).json(history);
    } catch (error) {
      console.error("Error getting donor history:", error);
      res.status(500).json({ error: 'Failed to get donor history' });
    }
});

app.get('/api/orders/recipient/:recipientId', async (req, res) => {
  try {
    const { recipientId } = req.params;
    const ordersSnapshot = await db.collection('orders').where('recipientId', '==', recipientId).get();

    const orderHistoryWithDetails = await Promise.all(
      ordersSnapshot.docs.map(async (orderDoc) => {
        const order = orderDoc.data();
        let donationData = {};

        // 👇 CRITICAL FIX: Ensure donationId exists and is a non-empty string before fetching
        if (order.donationId && typeof order.donationId === 'string' && order.donationId.length > 0) {
          const donationDoc = await db.collection('donations').doc(order.donationId).get();
          if (donationDoc.exists) {
            donationData = donationDoc.data();
          }
        }
        
        return {
          id: orderDoc.id,
          ...order,
          foodName: donationData.foodName || 'Unknown/Missing Food',
          category: donationData.category || 'Unknown Category',
          quantity: donationData.quantity || 'Unknown Quantity',
          status: donationData.status || 'unknown', 
          recipientRating: donationData.recipientRating || 0, 
          donorRating: donationData.donorRating || 0
        };
      })
    );
    
    res.status(200).json(orderHistoryWithDetails);
  } catch (error) {
    console.error("Error getting recipient history:", error);
    res.status(500).json({ error: 'Failed to get recipient history' });
  }
});


app.patch('/api/donations/status/:donationId', async (req, res) => {
    try {
        const { donationId } = req.params;
        const { status } = req.body;
        
        if (status !== 'completed') {
            return res.status(400).json({ error: 'Invalid status provided.' });
        }

        const donationRef = db.collection('donations').doc(donationId);
        const donationDoc = await donationRef.get();

        if (!donationDoc.exists) {
            return res.status(404).json({ error: 'Donation not found.' });
        }
        
        await donationRef.update({ status: 'completed' });
        
        console.log(`Donation ${donationId} status updated to: COMPLETED`);
        return res.status(200).json({ message: 'Donation marked as completed.' });

    } catch (error) {
        console.error('Error marking pickup:', error);
        return res.status(500).json({ error: 'Failed to update donation status.' });
    }
});



app.patch('/api/ratings/:donationId', async (req, res) => {
    try {
        const { donationId } = req.params;
        const { rating, role } = req.body; 

        if (!rating || (role !== 'donor' && role !== 'recipient')) {
            return res.status(400).json({ error: 'Rating (1-5) and valid role are required.' });
        }
        
        const donationRef = db.collection('donations').doc(donationId);
        const donationDoc = await donationRef.get();

        // Check if status is completed before allowing rating
        if (!donationDoc.exists || donationDoc.data().status !== 'completed') {
            return res.status(400).json({ error: 'Cannot rate an uncompleted donation or donation not found.' });
        }

        const ratingField = `${role}Rating`; // e.g., 'recipientRating'
        
        // Update the specific rating field
        await donationRef.update({ 
            [ratingField]: rating 
        });
        
        console.log(`Donation ${donationId}: ${role} posted rating ${rating}`);
        return res.status(200).json({ message: 'Rating submitted successfully.' });

    } catch (error) {
        console.error('Error submitting rating:', error);
        return res.status(500).json({ error: 'Failed to submit rating.' });
    }
});


app.listen(port, () => {
  console.log(`Backend server (CRASH-PROOF FIREBASE) running at http://localhost:${port}`);
});