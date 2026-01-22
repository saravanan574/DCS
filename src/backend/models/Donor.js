import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bloodGroup: { type: String },
    city: { type: String },
    age:{type:Number},
    contact: { type: String },
  },
  { timestamps: true }
);
export default mongoose.model("Donor", donorSchema);
