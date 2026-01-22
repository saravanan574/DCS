import express from "express";
import BloodRequest from "../models/BloodRequest.js";
import { authMiddleware } from "../middleware/auth.js";
import Notification from "../models/Notification.js";
import Donor from "../models/Donor.js";

const router = express.Router();

// 🔹 Helper function to calculate urgency
const calculateUrgency = (deadline) => {
  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);

  if (hoursLeft <= 24) return "High";
  if (hoursLeft <= 48) return "Medium";
  return "Low";
};

// 🔹 Get all blood requests (auto compute urgency on fetch)
router.get("/", authMiddleware, async (req, res) => {
  try {
    let requests = await BloodRequest.find({ deadline: { $gt: new Date() } });

    // Update urgency before sending (not saving to DB here)
    requests = requests.map(r => ({
      ...r.toObject(),
      urgency: calculateUrgency(r.deadline)
    }));

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Add new blood request (force initial Low urgency)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { bloodGroup, city, contact, deadline } = req.body;

    const urgency = calculateUrgency(deadline); 

    const newRequest = new BloodRequest({
      bloodGroup,
      urgency,
      city,
      contact,
      email: req.user.email,
      deadline,
      hospital: req.user.id,
      name: req.user.name
    });

    const savedRequest = await newRequest.save();

    const notification = new Notification({
      message: `Urgent need for ${bloodGroup} blood at ${req.user.name}.`,
      bloodGroup,
      type: "Blood",
      location: city,
      hospital: req.user.name,
      contact,
      link: savedRequest._id,
      urgent: urgency,
      email: req.user.email,
      deadline,
    });

    await notification.save();
    // ⚠️ Here you should fetch matching donors later
    // const { sendEmail } = await import("./email.js");
    // let user = await Donor.find({city,bloodGroup})
    // if(user.length == 0) user = await Donor.find();
    // user.forEach((i) => {
    //     const donorEmail = user.email; 
    //   sendEmail(
    //   donorEmail,
    //   `Blood Request - ${bloodGroup}`,
    //   `
    //   <h2>Urgent Blood Requirement</h2>
    //   <p><b>Hospital:</b> ${req.user.name}</p>
    //   <p><b>Blood Group:</b> ${bloodGroup}</p>
    //   <p><b>Location:</b> ${city}</p>
    //   <p><b>Urgency:</b> ${urgency}</p>
    //   <p><b>Contact:</b> ${contact}</p>
    //   <p>Please donate if possible 🙏</p>
    //   `
    // );
    // })
  

    res.json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// 🔹 Delete blood request
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { deadline: new Date() },  // expire it
      { new: true }
    );
    if(!updated)
      res.status(500).json({ message: "No Blood request found" });
    else
      res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
