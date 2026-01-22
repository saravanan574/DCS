
import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  licenseId: {
    type: String,
    required: true,
    unique: true,
  },
});

const Hospital = mongoose.model("Hospital", hospitalSchema);

export default Hospital;
