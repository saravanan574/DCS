import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Donor from "../models/Donor.js";

const router = express.Router();

// 🔹 Register Donor
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, city, contact,age, bloodGroup } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email, and password are required." });

    const existing = await Donor.findOne({ email });
    const exist_phone = await Donor.findOne({contact});
    if (existing) return res.status(400).json({ message: "Email already registered." });
    if (exist_phone) return res.status(400).json({message:"Contact number is already registered."});
    const hashed = await bcrypt.hash(password, 10);
    const donor = new Donor({ name, email, password: hashed, city,age, contact, bloodGroup });
    await donor.save();

    res.json({ message: "Donor registered successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

// 🔹 Login Donor
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const donor = await Donor.findOne({ email });
    
    if (!donor) return res.status(400).json({ message: "Donor not found." });

    const validPass = await bcrypt.compare(password, donor.password);
    if (!validPass) return res.status(400).json({ message: "Invalid password." });

    const token = jwt.sign(
      { id: donor._id, role: "donor",name:donor.name,email:donor.email },
      process.env.JWT_SECRET,
      { expiresIn: "10d" }
    );

    res.json({ token, donor });
  } catch (err) {
    res.status(500).json({ message: "Server error.", error: err.message });
  }
});

export default router;
