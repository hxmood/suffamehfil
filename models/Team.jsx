import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    points: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

export default mongoose.models.Team || mongoose.model('Team', teamSchema)