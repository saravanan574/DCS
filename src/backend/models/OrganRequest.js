import mongoose from 'mongoose';

const OrganRequestSchema = new mongoose.Schema({
  organType: {
    type: String,
    required: true,
  },
  name:{
    type: String,
    required:true,
  },
  urgency: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
OrganRequestSchema.index({deadline:1},{expiredAfterSeconds:0})
const OrganRequest = mongoose.model('OrganRequest', OrganRequestSchema);

export default OrganRequest;
