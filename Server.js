const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Firebase Admin SDK init
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// POST route to receive payment
app.post('/verify-payment', async (req, res) => {
  const { message, selectedAmount } = req.body;

  if (!message || !selectedAmount) {
    return res.status(400).json({ error: 'Missing message or amount' });
  }

  // Basic verification
  if (!message.toLowerCase().includes('confirmed') || !message.includes(`Ksh${selectedAmount}`)) {
    return res.status(400).json({ error: 'Invalid or mismatched payment message.' });
  }

  // Try extract phone number
  const phoneMatch = message.match(/\b07\d{8}\b/);
  const phone = phoneMatch ? phoneMatch[0] : 'Unknown';

  const durationHours = amountToHours(selectedAmount);

  const paymentData = {
    phone,
    message,
    amount: `Ksh${selectedAmount}`,
    date: new Date().toISOString(),
    durationHours,
  };

  try {
    await db.collection('payments').add(paymentData);
    return res.status(200).json({ success: true, message: 'Payment verified and saved.', durationHours });
  } catch (err) {
    return res.status(500).json({ error: 'Error saving payment: ' + err.message });
  }
});

function amountToHours(amount) {
  const map = { "50": 2, "80": 4, "110": 6, "160": 12, "210": 24 };
  return map[amount] || 0;
}

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
