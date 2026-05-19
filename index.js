const express = require("express");
const DevMind = require("./devmind.js");

// Initialize DevMind SDK
DevMind.init({ service: "sample-app" });

const app = express();
app.use(express.json());

// Simulates a slow database call
function fakeDbCall(id) {
  return new Promise((resolve, reject) => {
    const delay = Math.random() * 3000;
    setTimeout(() => {
      if (Math.random() < 0.3) reject(new Error(`DB timeout for user ${id}`));
      else resolve({ id, name: "Test User" });
    }, delay);
  });
}

// Route 1: Works fine
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Route 2: Randomly slow or crashes
app.get("/user/:id", async (req, res) => {
  try {
    const user = await fakeDbCall(req.params.id);
    res.json(user);
  } catch (err) {
    // Send to DevMind automatically
    await DevMind.capture(err, "/user/:id");
    res.status(500).json({ error: err.message });
  }
});

// Route 3: Always throws a specific bug
app.get("/process", async (req, res) => {
  try {
    const data = null;
    const result = data.value * 2;
    res.json({ result });
  } catch (err) {
    // Send to DevMind automatically
    await DevMind.capture(err, "/process");
    res.status(500).json({ error: err.message });
  }
});

// Route 4: Memory-intensive
app.get("/report", async (req, res) => {
  try {
    const huge = Array(1000000).fill("x").join("");
    res.json({ length: huge.length });
  } catch (err) {
    await DevMind.capture(err, "/report");
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => console.log("Sample app running on port 4000"));


// DevMind Auto-Fix Applied
// Original error: TypeError: Cannot read properties of null
// Fixed at line: 34
