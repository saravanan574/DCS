import express from "express";
import AvailableOrgan from "../models/AvailableOrgan.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// 🔹 Get all available organs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const organs = await AvailableOrgan.find();
    res.json(organs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Add new available organ
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { organType, city, contact } = req.body;
    const newOrgan = new AvailableOrgan({
      organType,
      city,
      name:req.user.name,
      contact,
      hospital: req.user.id,
    });
    await newOrgan.save();
    res.json(newOrgan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Delete available organ
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const a = await AvailableOrgan.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
