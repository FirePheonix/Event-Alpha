import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Guess from '@/models/guess';

export async function GET(req, { params }) {
  await connectToDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const userEmail = session.user.email;
  const { roundId } = await params;
  const guess = await Guess.findOne({ round: roundId, userEmail });
  return Response.json({ guess });
}

export async function POST(req, { params }) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    
    const userEmail = session.user.email;
    const { roundId } = await params;
    const { choice } = await req.json();
    
    console.log('POST /guess - roundId:', roundId, 'userEmail:', userEmail, 'choice:', choice);
    
    // Validate choice
    if (!['D', 'V', 'B', 'L'].includes(choice)) {
      console.log('Invalid choice:', choice);
      return Response.json({ error: 'Invalid choice' }, { status: 400 });
    }
    
    // Prevent multiple guesses
    const existing = await Guess.findOne({ round: roundId, userEmail });
    if (existing) {
      console.log('Already guessed for this round');
      return Response.json({ error: 'Already guessed' }, { status: 400 });
    }
    
    const guess = await Guess.create({ round: roundId, userEmail, choice });
    console.log('Guess created successfully:', guess);
    return Response.json({ guess });
  } catch (error) {
    console.error('Error in POST /guess:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
