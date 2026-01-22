import express from "express";
import Event from "../models/Events.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get all events
router.get("/", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find({endDateTime:{$gt:new Date()}});
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new event
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, city, startDateTime, endDateTime } = req.body;
    const newEvent = new Event({
      title,
      city,
      startDateTime, // store start datetime
      endDateTime,   // store end datetime
      hospital: req.user.id,
      name:req.user.name,
    });

    await newEvent.save();
    res.json(newEvent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete event
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
