import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { connectToDB } from 'utils/database';
import Round from 'models/round';
import Vote from 'models/vote';
import Guess from 'models/guess';
import User from 'models/user';

// Check if user is admin
const isAdmin = (email) => {
  return email === 'shubhsoch@gmail.com' || email === 'Rohan@dualite.dev';
};

export async function POST(request, { params }) {
  const { roundId } = await params;
  
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  try {
    // Find the game
    const round = await Round.findById(roundId);
    if (!round) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    // Count votes for each link to determine the most voted
    const voteCounts = await Vote.aggregate([
      { $match: { round: round._id } },
      { $group: { _id: '$linkChoice', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const mostVotedLink = voteCounts.length > 0 ? voteCounts[0]._id : null;

    // Update the round with the most voted link and end it
    await Round.findByIdAndUpdate(roundId, {
      status: 'ended',
      mostVotedLink,
      endedAt: new Date()
    });

    // Calculate and award points
    const guesses = await Guess.find({ round: roundId });
    const linkMappings = round.linkMappings;

    for (const guess of guesses) {
      let pointsEarned = 0;

      if (guess.round1Choice && guess.round2Choice) {
        // Find what tool the chosen link maps to
        const chosenLinkMapping = linkMappings.find(m => m.linkId === guess.round2Choice);
        
        if (chosenLinkMapping) {
          // 30 points if Round 1 choice matches Round 2 link mapping
          if (guess.round1Choice === chosenLinkMapping.tool) {
            pointsEarned += 30;
          }

          // 100 points if Round 1 choice matches the most voted link's tool
          if (mostVotedLink) {
            const mostVotedMapping = linkMappings.find(m => m.linkId === mostVotedLink);
            if (mostVotedMapping && guess.round1Choice === mostVotedMapping.tool) {
              pointsEarned += 100;
            }
          }
        }
      }

      // Update guess with points earned
      await Guess.findByIdAndUpdate(guess._id, { pointsEarned });

      // Update user's total points
      if (pointsEarned > 0) {
        await User.findOneAndUpdate(
          { email: guess.userEmail },
          { $inc: { points: pointsEarned } }
        );
      }
    }

    return Response.json({ 
      success: true, 
      message: 'Game ended and points calculated',
      mostVotedLink 
    });
  } catch (error) {
    console.error('Error ending game:', error);
    return Response.json({ error: 'Failed to end game' }, { status: 500 });
  }
}
