import express from "express";
import QRCode from "qrcode";

const app = express();
const port = 3001;
const sessions = new Map();

app.get("/qr/:userId", async (req, res) => {
  const userId = req.params.userId;
  const simulateUrl = `http://localhost:${port}/simulate/${userId}`;
  const qr = await QRCode.toDataURL(simulateUrl);
  res.send(`
    <html>
      <h2>Simulated zkPassport Verification</h2>
      <img src="${qr}" />
      <p>Scan or click <a href="${simulateUrl}">this link</a> to simulate verification.</p>
    </html>
  `);
});

app.get("/simulate/:userId", (req, res) => {
  const userId = req.params.userId;
  sessions.set(userId, { verified: true });
  console.log(`✅ Simulated verification for user: ${userId}`);
  res.json({ verified: true });
});

app.listen(port, () => {
  console.log(
    `🌐 Simulated zkPassport verifier running at http://localhost:${port}`
  );
});
