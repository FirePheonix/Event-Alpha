import dbConnect from '@/utils/database';
import Round from '@/models/round';
import Guess from '@/models/guess';
import User from '@/models/user';

export async function GET(req, { params }) {
  await dbConnect();
  const { roundId } = await params;
  const round = await Round.findById(roundId);
  if (!round) return Response.json({ error: 'Round not found' }, { status: 404 });
  // Previews for voting
  const previews = round.previews.map(p => ({ label: p.label, content: p.content }));
  // Reveal winner and award points
  let winner = round.winner;
  let points = null;
  if (winner) {
    // Award points to users who guessed correctly
    const correctGuesses = await Guess.find({ round: roundId, choice: winner });
    points = correctGuesses.length * 10; // Example: 10 points per correct guess
    await Promise.all(correctGuesses.map(async (g) => {
      await User.updateOne({ email: g.userEmail }, { $inc: { points: 10 } });
    }));
  }
  return Response.json({ previews, winner, points });
}
