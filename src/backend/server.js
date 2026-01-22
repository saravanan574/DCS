import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import donorAuthRoutes from "./routes/DonorAuth.js";
import hospitalAuthRoutes from "./routes/HospitalAuth.js";
import bloodRoutes from "./routes/blood.js";
import organRoutes from "./routes/organ.js";
import eventRoutes from "./routes/event.js";
import availableOrganRoutes from "./routes/AvailableOrgan.js";
import BloodRequest from "./models/BloodRequest.js";
import Hospitals from './models/Hospital.js'
import Event from "./models/Events.js";
import AvailableOrgan from './models/AvailableOrgan.js';
import OrganRequest from './models/OrganRequest.js';
import Notification from './models/Notification.js'
import Donor from "./models/Donor.js";
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:9002',
}));
app.use(express.json());

// Connect to Database
connectDB();

// Auth Routes (Public)
app.use("/api/auth/donor", donorAuthRoutes);
app.use("/api/auth/hospital", hospitalAuthRoutes);

// Private CRUD Routes (for hospitals, protected by middleware inside the route files)
app.use("/api/blood", bloodRoutes);
app.use("/api/organ", organRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/available-organs", availableOrganRoutes);

// Public GET Routes (for donors)
app.get("/api/public/blood", async (req, res) => {
  try {
    const requests = await BloodRequest.find({deadline:{$gt:new Date()}});
    const user = await Donor.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get("/api/notifications", async (req, res) => {
  try {
    await Notification.deleteMany({deadline:{$lt:new Date()}});

    const notify = await Notification.find({deadline:{$gt:new Date()}}).sort({deadline:1});
    res.json(notify);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/public/hospitals", async (req, res) => {
  try {
    const hospital = await Hospitals.find({},{name:1,email:1,phone:1,location:1});
    res.json(hospital);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/public/organ-requests', async (req, res) => {
  try {
    const requests = await OrganRequest.find().populate('hospital', 'name');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/public/events', async (req, res) => {
  try {
    const requests = await Event.find({endDateTime:{$gt:new Date()}});
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/public/available-organs', async (req, res) => {
  try {
    const organs = await AvailableOrgan.find().populate('hospital', 'name');
    res.json(organs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
