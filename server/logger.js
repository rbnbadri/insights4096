const fs = require("fs");
const path = require("path");

// const ignoredIps = ["49.37.249.208"]; // Replace with your actual IP
const ignoredIps = ["YOUR.IP.HERE"]; // Replace with your actual IP

const logPath = path.join(__dirname, "access.log");

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
  const ip = getClientIp(req);
  if (ignoredIps.includes(ip)) return;

  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);

  const detailStr = Object.entries(details)
    .map(([key, val]) => `${key}=${val}`)
    .join(" ");

  const logLine = `[${timestamp}] IP: ${ip} | Action: ${action} | ${detailStr}\n`;

  fs.appendFile(logPath, logLine, (err) => {
    if (err) console.error("Error writing log:", err);
  });
}

module.exports = { logAction, getClientIp };
