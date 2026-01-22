import mongoose from "mongoose";
import { string } from "zod";

const availableOrganSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    name: { type: String, required: true},
    organType: { type: String, required: true },
    city: { type: String, required: true },
    contact: { type: String, required: true },
    availableDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
export default mongoose.model("AvailableOrgan", availableOrganSchema);
