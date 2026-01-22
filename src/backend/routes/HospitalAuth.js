
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Hospital from "../models/Hospital.js";

const router = express.Router();

// 🔹 Register Hospital
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, location, phone, licenseId } = req.body;

    if (!name || !email || !password || !location || !phone || !licenseId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await Hospital.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const hospital = new Hospital({
      name,
      email,
      password: hashed,
      location,
      phone,
      licenseId,
    });
    await hospital.save();

    res.json({ message: "Hospital registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// 🔹 Login Hospital
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const hospital = await Hospital.findOne({ email });
    if (!hospital) {
      return res.status(400).json({ message: "Hospital not found." });
    }

    const validPass = await bcrypt.compare(password, hospital.password);
    if (!validPass) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { id: hospital._id, role: "hospital",name:hospital.name ,email:hospital.email},
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, hospital });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

export default router;
