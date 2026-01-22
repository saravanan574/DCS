import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    name:{type:String, required:true},
    bloodGroup: { type: String, required: true },
    urgency: { type: String, enum: ["Low", "Medium", "High"], required: true },
    city: { type: String, required: true },
    email:{type: String},
    contact: { type: String, required: true },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);
bloodRequestSchema.index({deadline:1},{expiredAfterSeconds:0});
export default mongoose.model("BloodRequest", bloodRequestSchema);
