// Developed by Shlok Lawand for RevoGreen Task
import React, { useEffect, useState, useCallback } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Label
} from "recharts";

// Parse sensor data
function parseData(dataStr) {
  const device = dataStr.slice(0, 2);
  const voltage = dataStr.match(/V(\d+)/)?.[1];
  const current = dataStr.match(/C(\d+)/)?.[1];
  const temp = dataStr.match(/T(\d+)/)?.[1];
  return { device, voltage, current, temp };
}

function getTempColor(temp) {
  if (!temp) return "black";
  const t = parseInt(temp);
  if (t <= 50) return "green";
  else if (t <= 80) return "orange";
  else return "red";
}

// Hook to manage historical sensor data
function useHistoricalData() {
  const [history, setHistory] = useState({ D1: [], D2: [] });

  const addData = useCallback((device, temp, voltage, current) => {
    if (!temp || !voltage || !current) return;
    setHistory(prev => {
      const updated = { ...prev };
      const time = new Date().toLocaleTimeString();
      updated[device] = [
        ...(updated[device] || []),
        {
          time,
          temp: parseInt(temp),
          voltage: parseInt(voltage),
          current: parseInt(current)
        }
      ];
      if (updated[device].length > 10) updated[device].shift();
      return updated;
    });
  }, []);

  return [history, addData];
}

// Mini graph with axis labels and legends
function MiniChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="time">
            <Label value="Time" offset={-5} position="insideBottom" />
          </XAxis>
          <YAxis>
            <Label value="Sensor" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="temp" stroke="#ff7300" dot={false} name="Temperature (°C)" />
          <Line type="monotone" dataKey="voltage" stroke="#387908" dot={false} name="Voltage (V)" />
          <Line type="monotone" dataKey="current" stroke="#8884d8" dot={false} name="Current (A)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Device card with chart
function DeviceCard({ label, data, chartData }) {
  const { device, voltage, current, temp } = parseData(data);
  const status = voltage && current && temp ? "✅ Online" : "🔴 Offline";
  const tempColor = getTempColor(temp);

  return (
    <div className="card">
      <h2>{label} ({device})</h2>
      <p>Status: {status}</p>
      <p>Voltage: {voltage ?? "--"} V</p>
      <p>Current: {current ?? "--"} A</p>
      <p style={{ color: tempColor }}>Temperature: {temp ?? "--"} °C</p>
      <MiniChart data={chartData[device]} />
    </div>
  );
}

function Home({ data, lastUpdated, chartData }) {
  return (
    <>
      <div className="grid">
        <DeviceCard label="Device 1" data={data.D1} chartData={chartData} />
        <DeviceCard label="Device 2" data={data.D2} chartData={chartData} />
      </div>
      <p className="timestamp">Last updated: {lastUpdated}</p>
    </>
  );
}

function Device2Screen({ data, lastUpdated, chartData }) {
  return (
    <>
      <div className="grid">
        <DeviceCard label="Device 2" data={data.D2} chartData={chartData} />
      </div>
      <p className="timestamp">Last updated: {lastUpdated}</p>
    </>
  );
}

function App() {
  const [data, setData] = useState({ D1: "", D2: "" });
  const [lastUpdated, setLastUpdated] = useState("");
  const [history, addTempData] = useHistoricalData();

  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:5000/data")
        .then((res) => res.json())
        .then((newData) => {
          setData(newData);
          setLastUpdated(new Date().toLocaleTimeString());
          const d1 = parseData(newData.D1);
          const d2 = parseData(newData.D2);
          addTempData("D1", d1.temp, d1.voltage, d1.current);
          addTempData("D2", d2.temp, d2.voltage, d2.current);
        })
        .catch((err) => console.error("Fetch error:", err));
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [addTempData]);

  return (
    <Router>
      <div className="App">
        <h1>Device Monitor</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/device2">Device 2</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home data={data} lastUpdated={lastUpdated} chartData={history} />} />
          <Route path="/device2" element={<Device2Screen data={data} lastUpdated={lastUpdated} chartData={history} />} />
        </Routes>
        <footer>
          &copy; {new Date().getFullYear()}| All rights reserved | Developed by Shlok Lawand
        </footer>
      </div>
    </Router>
  );
}

export default App;
