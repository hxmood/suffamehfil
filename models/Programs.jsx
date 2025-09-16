import mongoose from 'mongoose';

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['bzone', 'czone', 'yzone', 'general'], // update if you use different categories
    },
    type: {
      type: String,
      enum: ['individual', 'group'],
      default: 'individual',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Program || mongoose.model('Program', programSchema);
