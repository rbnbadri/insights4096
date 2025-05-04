const express = require("express");
const router = express.Router();

router.get("/summary", async (req, res) => {
  try {
    const admin = require("firebase-admin");

    if (!admin.apps.length) {
      const serviceKey = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!serviceKey) return res.status(500).json({ error: "No credentials" });

      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceKey)),
      });
    }

    const db = admin.firestore();
    const snapshot = await db.collection("logs").get();

    const all_data = snapshot.docs.map((doc) => doc.data());

    const total_logs = all_data.length;
    const usernamesSet = new Set();
    let pgns_downloaded = 0;

    all_data.forEach((entry) => {
      const action = entry.action;
      const username = entry.details?.username;

      if (username) usernamesSet.add(username);
      if (action === "pgn_downloaded") pgns_downloaded++;
    });

    res.json({
      total_logs,
      usernames_analyzed: usernamesSet.size,
      pgns_downloaded,
    });
  } catch (err) {
    console.error("Error summarizing logs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
