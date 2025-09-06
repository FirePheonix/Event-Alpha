import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  round: { type: mongoose.Schema.Types.ObjectId, ref: 'Round' },
  linkChoice: { type: String, enum: ['LinkA', 'LinkB', 'LinkC', 'LinkD'] }, // Round 2 link vote
  createdAt: { type: Date, default: Date.now },
});

VoteSchema.index({ userEmail: 1, round: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);
