import { connectToDB } from '@/utils/database';
import Round from '@/models/round';
import Guess from '@/models/guess';
import Vote from '@/models/vote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request, { params }) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId } = await params;
    const { choice } = await request.json();

    console.log('Round 2 API called:', { gameId, choice, userEmail: session.user.email });

    // Check if game exists and is active
    const game = await Round.findById(gameId);
    if (!game) {
      console.log('Game not found:', gameId);
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    console.log('Game status:', game.status);
    if (game.status !== 'active') {
      console.log('Game is not active, status:', game.status);
      return Response.json({ error: 'Game is not active' }, { status: 400 });
    }

    // Validate choice against expected link IDs
    if (!['LinkA', 'LinkB', 'LinkC', 'LinkD'].includes(choice)) {
      console.log('Invalid choice provided:', choice);
      return Response.json({ error: 'Invalid choice' }, { status: 400 });
    }

    // Check if user has completed Round 1
    let guess = await Guess.findOne({
      round: gameId,
      userEmail: session.user.email
    });

    if (!guess || !guess.round1Choice) {
      return Response.json({ error: 'Must complete Round 1 first' }, { status: 400 });
    }

    if (guess.round2Choice) {
      return Response.json({ error: 'Round 2 choice already made' }, { status: 400 });
    }

    // Update guess with Round 2 choice
    guess.round2Choice = choice;
    guess.round2CompletedAt = new Date();
    await guess.save();

    // Also record the vote for tracking most voted link
    await Vote.findOneAndUpdate(
      {
        userEmail: session.user.email,
        round: gameId
      },
      {
        userEmail: session.user.email,
        round: gameId,
        linkChoice: choice,
        createdAt: new Date()
      },
      { upsert: true }
    );

    return Response.json({ success: true, message: 'Round 2 choice saved' });

  } catch (error) {
    console.error('Error in Round 2 API:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
