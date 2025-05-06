const ignoredIps = ["49.37.249.208"];

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    "unknown"
  )
    .split(",")[0]
    .trim();
}

function logAction(req, action, details = {}) {
  console.log(process.env.ENABLE_LOGGING);
  if (process.env.ENABLE_LOGGING !== "true") return;

  const serviceKey = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceKey) return; // Skip logging if not running in the right env

  const ip = getClientIp(req);
  if (ignoredIps.includes(ip)) return;

  const now = new Date().toLocaleString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
  const timestamp = now.replace(",", "").replace(/\//g, "-");

  // Lazy import and initialize firebase-admin
  const admin = require("firebase-admin");
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceKey)),
    });
  }

  const db = admin.firestore?.();
  if (!db) return;

  db.collection("logs")
    .add({
      timestamp,
      ip,
      action,
      details,
    })
    .catch((err) => {
      console.error("Error logging to Firestore:", err);
    });
}

module.exports = { logAction, getClientIp };
