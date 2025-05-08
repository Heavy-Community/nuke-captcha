import express from "express";
import QRCode from "qrcode";

const app = express();
const port = 3001;
const sessions = new Map();

// Add sessions endpoint
app.get("/sessions", (req, res) => {
  const sessionsObj = {};
  for (const [userId, session] of sessions.entries()) {
    sessionsObj[userId] = session;
  }
  res.json(sessionsObj);
});

app.get("/qr/:userId", async (req, res) => {
  const userId = req.params.userId;
  // Step 1: Show mocked zkPassport verification
  res.send(`
    <html>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <style>
          body {
            background: #f6f8fa;
            min-height: 100vh;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .card {
            background: #fff;
            border-radius: 18px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            padding: 32px 24px 28px 24px;
            max-width: 370px;
            width: 100%;
            text-align: center;
          }
          .mock-passport {
            width: 100%;
            max-width: 320px;
            height: 140px;
            background: linear-gradient(45deg, #1a237e, #0d47a1);
            margin: 0 auto 18px auto;
            border-radius: 10px;
            color: white;
            padding: 18px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.10);
          }
          .mock-passport h3 {
            margin: 0 0 8px 0;
            font-weight: 600;
            font-size: 1.1rem;
            letter-spacing: 0.01em;
          }
          .mock-passport p {
            margin: 4px 0;
            font-size: 0.98rem;
            letter-spacing: 0.01em;
          }
          .title {
            font-size: 1.6rem;
            font-weight: 700;
            color: #222;
            margin-bottom: 12px;
            letter-spacing: 0.01em;
          }
          .desc {
            color: #444;
            margin-bottom: 18px;
            font-size: 1rem;
            letter-spacing: 0.01em;
          }
          .button {
            background: linear-gradient(90deg, #4CAF50 60%, #43a047 100%);
            border: none;
            color: white;
            padding: 14px 0;
            width: 100%;
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 18px;
            box-shadow: 0 2px 8px rgba(76,175,80,0.08);
            transition: background 0.2s, box-shadow 0.2s;
            font-family: inherit;
            letter-spacing: 0.01em;
          }
          .button:hover, .button:active {
            background: linear-gradient(90deg, #43a047 60%, #388e3c 100%);
            box-shadow: 0 4px 16px rgba(76,175,80,0.13);
          }
        </style>
      </head>
      <body>
        <div class='card'>
          <div class='title'>zkPassport Verification</div>
          <div class='mock-passport'>
            <h3>Digital Passport</h3>
            <p>User ID: ${userId}</p>
            <p>Status: Verified (mocked)</p>
          </div>
          <div class='desc'>Congratulations! You have (mock) proved your humanness.</div>
          <button class='button' onclick="window.location.href='/motion-qr/${userId}'">Continue to Motion Verification</button>
        </div>
      </body>
    </html>
  `);
});

app.get("/motion-qr/:userId", async (req, res) => {
  const userId = req.params.userId;
  // Step 2: Show QR code for Expo Go app with userId as a query param
  const expoUrl = `exp://192.168.1.7:8081?userId=${userId}`; // Update with your Expo URL if needed
  const qr = await QRCode.toDataURL(expoUrl);
  res.send(`
    <html>
      <head>
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            text-align: center;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .qr-container {
            margin: 20px 0;
          }
          .instructions {
            margin: 20px 0;
            text-align: left;
            padding: 15px;
            background-color: #e3f2fd;
            border-radius: 5px;
          }
          .instructions ol {
            margin: 0;
            padding-left: 20px;
          }
        </style>
      </head>
      <body>
        <div class=\"container\">\n          <h2>Step 2: Motion Verification (in Expo App)</h2>\n          <div class=\"qr-container\">\n            <img src=\"${qr}\" style=\"max-width: 200px;\" />\n            <p>Scan this QR code with <b>Expo Go</b> to open the motion verification app.</p>\n            <p style=\"color: #888; font-size: 14px;\">(Opens your Expo app and passes userId)</p>\n          </div>\n          <div class=\"instructions\">\n            <h3>Instructions:</h3>\n            <ol>\n              <li>Make sure your phone is on the same network as this computer</li>\n              <li>Open the Expo Go app on your phone</li>\n              <li>Scan the QR code above</li>\n              <li>Your Expo app will open automatically</li>\n            </ol>\n          </div>\n        </div>\n      </body>\n    </html>\n  `);
});

app.get("/mock-verify/:userId", (req, res) => {
  const userId = req.params.userId;
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            text-align: center;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
          }
          .button {
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
          }
          .mock-passport {
            width: 300px;
            height: 200px;
            background: linear-gradient(45deg, #1a237e, #0d47a1);
            margin: 20px auto;
            border-radius: 10px;
            color: white;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Mock zkPassport Verification</h2>
          <div class="mock-passport">
            <h3>Digital Passport</h3>
            <p>User ID: ${userId}</p>
            <p>Status: Verified</p>
          </div>
          <button class="button" onclick="window.location.href='exp://192.168.1.1:19000/motion/${userId}'">Continue to Motion Verification</button>
        </div>
      </body>
    </html>
  `);
});

app.get("/motion/:userId", (req, res) => {
  const userId = req.params.userId;
  sessions.set(userId, { verified: true }); // Mark as verified when starting motion verification
  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            text-align: center;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
          }
          .button {
            background-color: #4CAF50;
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
            border-radius: 4px;
          }
          .button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Motion Verification</h2>
          <p>Please draw an infinity (∞) pattern with your phone to verify you are human.</p>
          <button class="button" onclick="startMotion()" id="startButton">Start Motion</button>
          <div id="result"></div>
        </div>
        <script>
          let recording = false;
          let motionData = [];
          let patternDetected = false;

          function startMotion() {
            if (recording) return;
            const button = document.getElementById('startButton');
            button.disabled = true;
            button.textContent = 'Recording...';
            recording = true;
            patternDetected = false;
            motionData = [];
            // Request device motion permission
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
              DeviceMotionEvent.requestPermission()
                .then(permissionState => {
                  if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                    setTimeout(() => {
                      window.removeEventListener('devicemotion', handleMotion);
                      recording = false;
                      button.disabled = false;
                      button.textContent = 'Start Motion';
                      analyzeMotion();
                    }, 5000);
                  } else {
                    showError('Permission denied for motion sensors.');
                  }
                })
                .catch(() => showError('Permission request failed.'));
            } else {
              window.addEventListener('devicemotion', handleMotion);
              setTimeout(() => {
                window.removeEventListener('devicemotion', handleMotion);
                recording = false;
                button.disabled = false;
                button.textContent = 'Start Motion';
                analyzeMotion();
              }, 5000);
            }
          }

          function handleMotion(event) {
            if (!recording) return;
            const { accelerationIncludingGravity } = event;
            motionData.push({
              x: accelerationIncludingGravity.x,
              y: accelerationIncludingGravity.y
            });
          }

          function analyzeMotion() {
            if (motionData.length < 10) return;
            const leftMoves = motionData.filter(p => p.x < -0.5).length;
            const rightMoves = motionData.filter(p => p.x > 0.5).length;
            const upMoves = motionData.filter(p => p.y < -0.5).length;
            const downMoves = motionData.filter(p => p.y > 0.5).length;
            if (leftMoves > 5 && rightMoves > 5 && upMoves > 5 && downMoves > 5) {
              patternDetected = true;
              const resultDiv = document.getElementById('result');
              resultDiv.innerHTML = '<p style="color: green;">✅ Infinity motion detected!</p>';
              // Send verification result to server
              fetch('/motion/verify/' + '${userId}', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ verified: true })
              });
            } else {
              const resultDiv = document.getElementById('result');
              resultDiv.innerHTML = '<p style="color: red;">❌ Motion pattern not detected. Please try again.</p>';
            }
          }

          function showError(msg) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '<p style="color: red;">' + msg + '</p>';
          }
        </script>
      </body>
    </html>
  `);
});

app.post("/motion/verify/:userId", (req, res) => {
  const userId = req.params.userId;
  const session = sessions.get(userId);
  if (session && session.verified) {
    session.motionVerified = true;
    console.log(`✅ Motion verification completed for user: ${userId}`);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "User not found or not verified" });
  }
});

app.listen(port, () => {
  console.log(
    `🌐 Mock verification server running at http://localhost:${port}`
  );
  console.log("To use on your phone:");
  console.log(
    "1. Make sure your phone is on the same network as this computer"
  );
  console.log("2. Find your computer's local IP address (e.g., 192.168.1.1)");
  console.log("3. Replace the IP in the code with your computer's IP");
  console.log("4. Scan the QR code with Expo Go app");
});
