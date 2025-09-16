import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    category: {
        type: String,
        enum: ['bzone', 'czone', 'yzone', 'general'],
        required: true
    },

    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    }
}, {timestamps: true})

export default mongoose.models.Participant || mongoose.model('Participant', participantSchema)