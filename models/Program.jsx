// models/Program.js
import mongoose from "mongoose";

const programSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["bzone", 'czone', 'yzone', 'general'],
    required: true
  },
  participants: [{
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant"
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    }
  }],
  type: {
    type: String,
    enum: ['individual', 'group'],
    required: true,
    default: 'individual',
  },
  codeLetters: [{
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participant',
    },
    code: String,
  }]
}, { timestamps: true });

// Add method to check team limits
programSchema.methods.canAddParticipant = async function(teamId) {
  if (this.type === 'individual') return true;
  
  const teamCount = this.participants.filter(p => 
    p.team && p.team.equals(teamId)
  ).length;
  
  return teamCount < 2;
};

export default mongoose.models.Program || mongoose.model("Program", programSchema);