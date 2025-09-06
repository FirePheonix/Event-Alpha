import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/utils/database';
import Round from '@/models/round';
import Vote from '@/models/vote';
import Guess from '@/models/guess';
import User from '@/models/user';

export async function POST(req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  // Check if user is admin (you can implement your own admin check logic)
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // For now, let's assume any logged-in user can close rounds
  // In production, you'd check for admin role
  
  const { roundId } = await params;
  const round = await Round.findById(roundId);
  
  if (!round) {
    return Response.json({ error: 'Round not found' }, { status: 404 });
  }
  
  if (round.status === 'revealed') {
    return Response.json({ error: 'Round already closed' }, { status: 400 });
  }
  
  // Find preview with most votes
  const votes = await Vote.find({ round: roundId });
  const voteCounts = {};
  
  // Count votes for each preview
  votes.forEach(vote => {
    voteCounts[vote.previewLabel] = (voteCounts[vote.previewLabel] || 0) + 1;
  });
  
  // Find winner preview
  let winnerLabel = null;
  let maxVotes = 0;
  for (const [label, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      winnerLabel = label;
    }
  }
  
  let winnerTool = null;
  if (winnerLabel) {
    // Map winner preview to original tool
    const winnerPreview = round.previews.find(p => p.label === winnerLabel);
    winnerTool = winnerPreview?.tool;
  }
  
  // Update round with winner
  round.winner = winnerTool;
  round.status = 'revealed';
  await round.save();
  
  // Award points to users who guessed correctly
  if (winnerTool) {
    const correctGuesses = await Guess.find({ round: roundId, choice: winnerTool });
    
    // Award 100 points to each correct guesser
    for (const guess of correctGuesses) {
      await User.updateOne(
        { email: guess.userEmail },
        { $inc: { points: 100 } }
      );
    }
  }
  
  return Response.json({ 
    success: true, 
    winnerTool, 
    winnerLabel, 
    pointsAwarded: winnerTool ? await Guess.countDocuments({ round: roundId, choice: winnerTool }) * 100 : 0
  });
}
