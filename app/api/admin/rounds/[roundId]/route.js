import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Round from '@/models/round';

// Check if user is admin
const isAdmin = (email) => {
  return email === 'shubhsoch@gmail.com';
};

export async function DELETE(request, { params }) {
  const { roundId } = await params;
  
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  try {
    await Round.findByIdAndDelete(roundId);
    return Response.json({ success: true, message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    return Response.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { roundId } = await params;
  
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, endedAt } = body;
    
    if (!['waiting', 'active', 'ended'].includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData = { status };
    if (status === 'ended' && endedAt) {
      updateData.endedAt = endedAt;
    }

    const round = await Round.findByIdAndUpdate(
      roundId,
      updateData,
      { new: true }
    );

    return Response.json({ success: true, round });
  } catch (error) {
    console.error('Error updating game status:', error);
    return Response.json({ error: 'Failed to update game status' }, { status: 500 });
  }
}
