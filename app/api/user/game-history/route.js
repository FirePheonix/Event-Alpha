import { connectToDB } from '@/utils/database';
import Guess from '@/models/guess';
import Round from '@/models/round';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    await connectToDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Get user's game history - all guesses with round information
    const userGuesses = await Guess.find({ 
      userEmail: userEmail,
      round1Choice: { $exists: true, $ne: null }
    })
    .populate('round')
    .sort({ createdAt: -1 })
    .limit(10); // Get last 10 games

    const gameHistory = userGuesses
      .filter(guess => guess.round && guess.round._id) // Filter out guesses with null/invalid rounds
      .map(guess => {
        const round = guess.round;
        const completionDate = guess.round2CompletedAt || guess.round1CompletedAt || guess.createdAt;
        
        return {
          gameId: round._id,
          gameTitle: round.title || `Game Session`,
          gameStatus: round.status,
          userRound1Choice: guess.round1Choice,
          userRound2Choice: guess.round2Choice,
          pointsEarned: guess.pointsEarned || 0,
          completedAt: completionDate,
          isFullyCompleted: guess.round1Choice && guess.round2Choice,
          createdAt: guess.createdAt
        };
      });

    return Response.json({
      success: true,
      gameHistory: gameHistory,
      totalGamesPlayed: gameHistory.length
    });

  } catch (error) {
    console.error('Error fetching user game history:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}