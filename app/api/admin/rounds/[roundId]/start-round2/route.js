import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { connectToDB } from 'utils/database';
import Round from 'models/round';

// Check if user is admin
const isAdmin = (email) => {
  return email === 'shubhsoch@gmail.com' || email === 'rohan@dualite.dev';
};

export async function POST(request, { params }) {
  const { roundId } = await params;
  
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  try {
    const round = await Round.findByIdAndUpdate(
      roundId,
      { status: 'round2' },
      { new: true }
    );

    if (!round) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    return Response.json({ success: true, round });
  } catch (error) {
    console.error('Error starting Round 2:', error);
    return Response.json({ error: 'Failed to start Round 2' }, { status: 500 });
  }
}
