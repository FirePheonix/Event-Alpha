import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDB } from '@/utils/database';
import Round from '@/models/round';

export async function GET(req, { params }) {
  await connectToDB();
  const { roundId } = await params;
  const round = await Round.findById(roundId);
  if (!round) {
    return Response.json({ error: 'Round not found' }, { status: 404 });
  }
  return Response.json({ round });
}
