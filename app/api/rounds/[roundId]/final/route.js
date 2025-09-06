import dbConnect from '@/utils/database';
import Round from '@/models/round';
import Guess from '@/models/guess';
import User from '@/models/user';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET(req, { params }) {
  await dbConnect();
  const { roundId } = await params;
  const round = await Round.findById(roundId);
  if (!round) return Response.json({ error: 'Round not found' }, { status: 404 });
  // Show original mapping
  const previews = round.previews.map(p => ({ label: p.label, tool: p.tool, content: p.content }));
  const winnerTool = round.winner;
  let winnerLabel = null;
  if (winnerTool) {
    const winnerPreview = round.previews.find(p => p.tool === winnerTool);
    winnerLabel = winnerPreview?.label;
  }
  // Get current user
  let userGuessedCorrectly = false;
  let pointsAdded = false;
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (userEmail && winnerTool) {
      const guess = await Guess.findOne({ round: roundId, userEmail });
      if (guess && guess.choice === winnerTool) {
        userGuessedCorrectly = true;
        // Add points if not already added
        const user = await User.findOne({ email: userEmail });
        if (user) {
          if (!user.lastWinRoundIds || !user.lastWinRoundIds.includes(roundId)) {
            user.points += 100;
            user.lastWinRoundIds = [...(user.lastWinRoundIds || []), roundId];
            await user.save();
            pointsAdded = true;
          }
        }
      }
    }
  } catch (e) {}
  return Response.json({ previews, winnerTool, winnerLabel, userGuessedCorrectly, pointsAdded });
}
