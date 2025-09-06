import { connectToDB } from '@/utils/database';
import Round from '@/models/round';
import Guess from '@/models/guess';
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

    console.log('Round 1 API called:', { gameId, choice, userEmail: session.user.email });

    // Validate choice
    if (!['Dualite', 'Lovable', 'Bolt', 'V0'].includes(choice)) {
      console.log('Invalid choice provided:', choice);
      return Response.json({ error: 'Invalid choice' }, { status: 400 });
    }

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

    // Check if user already has a guess for this round
    let guess = await Guess.findOne({
      round: gameId,
      userEmail: session.user.email
    });

    console.log('Existing guess:', guess);
    if (guess && guess.round1Choice) {
      console.log('Round 1 choice already made:', guess.round1Choice);
      return Response.json({ error: 'Round 1 choice already made' }, { status: 400 });
    }

    // Create or update guess
    if (!guess) {
      guess = new Guess({
        round: gameId,
        userEmail: session.user.email,
        round1Choice: choice,
        round1CompletedAt: new Date()
      });
    } else {
      guess.round1Choice = choice;
      guess.round1CompletedAt = new Date();
    }

    await guess.save();

    return Response.json({ success: true, message: 'Round 1 choice saved' });

  } catch (error) {
    console.error('Error in Round 1 API:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
