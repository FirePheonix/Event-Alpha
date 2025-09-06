import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import dbConnect from '@/utils/database';
import Vote from '@/models/vote';

export async function GET(req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const userEmail = session.user.email;
  const { roundId } = await params;
  const vote = await Vote.findOne({ round: roundId, userEmail });
  return Response.json({ vote });
}

export async function POST(req, { params }) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const userEmail = session.user.email;
  const { roundId } = await params;
  const { previewLabel } = await req.json();
  
  // Validate preview label
  if (!['A', 'B', 'C', 'D'].includes(previewLabel)) {
    return Response.json({ error: 'Invalid preview label' }, { status: 400 });
  }
  
  // Prevent multiple votes
  const existing = await Vote.findOne({ round: roundId, userEmail });
  if (existing) return Response.json({ error: 'Already voted' }, { status: 400 });
  const vote = await Vote.create({ round: roundId, userEmail, previewLabel });
  return Response.json({ vote });
}
