import express from "express";
import OrganRequest from "../models/OrganRequest.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Get all organ requests
router.get("/", authMiddleware, async (req, res) => {
  try {
    const requests = await OrganRequest.find({deadline:{$gt:new Date()}});
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new organ request
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { organType, urgency, city, contact, deadline } = req.body;
    const newRequest = new OrganRequest({
      organType,
      urgency,
      city,
      name:req.user.name,
      contact,
      deadline,
      hospital: req.user.id,
    });
    await newRequest.save();
    res.json(newRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete organ request
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await OrganRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
