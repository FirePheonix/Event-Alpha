import { connectToDB } from '@utils/database';
import Guess from '@models/guess';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    await connectToDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all guesses from all games and aggregate points by user
    const allGuesses = await Guess.find({
      round1Choice: { $exists: true, $ne: null },
      round2Choice: { $exists: true, $ne: null },
      pointsEarned: { $exists: true }
    }).populate('round');

    console.log(`Found ${allGuesses.length} completed guesses across all games`);

    // Aggregate points by user email
    const userPoints = {};
    const userGameCounts = {};

    allGuesses.forEach(guess => {
      const email = guess.userEmail;
      const points = guess.pointsEarned || 0;
      
      if (!userPoints[email]) {
        userPoints[email] = 0;
        userGameCounts[email] = 0;
      }
      
      userPoints[email] += points;
      userGameCounts[email] += 1;
    });

    // Convert to leaderboard array and sort by total points
    const globalLeaderboard = Object.entries(userPoints).map(([email, totalPoints]) => ({
      userEmail: email,
      totalPoints: totalPoints,
      gamesPlayed: userGameCounts[email],
      averagePoints: Math.round(totalPoints / userGameCounts[email] * 10) / 10
    })).sort((a, b) => b.totalPoints - a.totalPoints);

    console.log(`Global leaderboard generated with ${globalLeaderboard.length} players`);

    // Add ranking to each player
    globalLeaderboard.forEach((player, index) => {
      player.rank = index + 1;
    });

    // Find current user's stats with rank
    const currentUserEmail = session.user.email;
    let userStats = globalLeaderboard.find(player => player.userEmail === currentUserEmail);
    
    if (!userStats) {
      userStats = {
        userEmail: currentUserEmail,
        totalPoints: 0,
        gamesPlayed: 0,
        averagePoints: 0,
        rank: null
      };
    }

    return Response.json({
      success: true,
      userStats: userStats,
      globalLeaderboard: globalLeaderboard,
      totalPlayers: globalLeaderboard.length
    });

  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
