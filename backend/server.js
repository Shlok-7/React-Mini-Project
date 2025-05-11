const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

app.use(cors());

function generateRandomData(deviceId) {
  const V = Math.floor(Math.random() * 100);
  const C = Math.floor(Math.random() * 100);
  const T = Math.floor(Math.random() * 100);
  return `${deviceId}V${V}C${C}T${T}`;
}

let currentData = {
  D1: generateRandomData("D1"),
  D2: generateRandomData("D2"),
};

setInterval(() => {
  currentData.D1 = generateRandomData("D1");
  currentData.D2 = generateRandomData("D2");
}, 2000);

app.get("/data", (req, res) => {
  res.json(currentData);
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});