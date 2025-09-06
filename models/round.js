import mongoose from 'mongoose';

const LinkMappingSchema = new mongoose.Schema({
  linkId: { type: String, enum: ['LinkA', 'LinkB', 'LinkC', 'LinkD'], required: true },
  tool: { type: String, enum: ['Dualite', 'Lovable', 'Bolt', 'V0'], required: true },
  url: String,
  description: String
});

const RoundSchema = new mongoose.Schema({
  title: String,
  linkMappings: [LinkMappingSchema], // Admin defines LinkA->Lovable, LinkB->Bolt, etc.
  status: { type: String, enum: ['waiting', 'active', 'ended'], default: 'waiting' },
  mostVotedLink: String, // Will be determined after game ends
  createdAt: { type: Date, default: Date.now },
  endedAt: Date
});

export default mongoose.models.Round || mongoose.model('Round', RoundSchema);
