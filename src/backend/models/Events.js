import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true },
    title: { type: String, required: true },
    city: { type: String, required: true },
    startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  name:{type:String,required:true},
  },
  { timestamps: true }
);
eventSchema.index({endDateTime:1},{expiredAfterSeconds:0})
export default mongoose.model("Event", eventSchema);
