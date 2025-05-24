const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://prediction-94bf9-default-rtdb.firebaseio.com"
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// Save payment verification data
app.post("/api/save-payment", async (req, res) => {
  const { phone, message, amount } = req.body;

  if (!phone || !message || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await db.collection("verifiedUsers").add({
      phone,
      message,
      amount,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ success: true, message: "Payment saved" });
  } catch (err) {
    console.error("Error saving payment:", err);
    res.status(500).json({ error: "Failed to save payment" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
