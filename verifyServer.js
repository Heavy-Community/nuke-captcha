import express from "express";
import QRCode from "qrcode";
// import zkPassport from '@zkpassport/sdk'; ← We’ll add this later

const app = express();
const port = 3001;
const sessions = new Map();

app.get("/qr/:userId", async (req, res) => {
  const userId = req.params.userId;
  const sessionId = `${userId}-${Date.now()}`;
  sessions.set(sessionId, { verified: false });

  const proofUrl = `http://localhost:${port}/prove/${sessionId}`;
  const qr = await QRCode.toDataURL(proofUrl);

  res.send(`
    <html>
      <h2>Scan to verify with zkPassport</h2>
      <img src="${qr}" />
    </html>
  `);
});

app.get("/prove/:sessionId", async (req, res) => {
  const sessionId = req.params.sessionId;
  if (sessions.has(sessionId)) {
    sessions.get(sessionId).verified = true;
    res.send("✅ zkPassport proof submitted!");
  } else {
    res.status(404).send("❌ Invalid session.");
  }
});

app.listen(port, () => {
  console.log(`🌐 Verifier running at http://localhost:${port}`);
});
