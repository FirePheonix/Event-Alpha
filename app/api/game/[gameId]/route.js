import { connectToDB } from '@/utils/database';
import Round from '@/models/round';
import Guess from '@/models/guess';
import Vote from '@/models/vote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request, { params }) {
  try {
    await connectToDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId } = await params;
    const game = await Round.findById(gameId);
    
    if (!game) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get user's current choices
    const userGuess = await Guess.findOne({
      userEmail: session.user.email,
      round: gameId
    });

    return Response.json({ 
      game,
      userGuess: userGuess || null
    });
    
  } catch (error) {
    console.error('Error fetching game:', error);
    return Response.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}
