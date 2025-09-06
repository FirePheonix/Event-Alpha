import mongoose from 'mongoose';

const GuessSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  round: { type: mongoose.Schema.Types.ObjectId, ref: 'Round' },
  round1Choice: { type: String, enum: ['Dualite', 'Lovable', 'Bolt', 'V0'] }, // Round 1: Tool choice
  round1CompletedAt: Date, // When user completed round 1
  round2Choice: { type: String, enum: ['LinkA', 'LinkB', 'LinkC', 'LinkD'] }, // Round 2: Link choice
  round2CompletedAt: Date, // When user completed round 2
  pointsEarned: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

GuessSchema.index({ userEmail: 1, round: 1 }, { unique: true });

export default mongoose.models.Guess || mongoose.model('Guess', GuessSchema);
