import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDB } from 'utils/database';
import Round from 'models/round';

// Check if user is admin
const isAdmin = (email) => {
  return email === 'shubhsoch@gmail.com' || email === 'Rohan@dualite.dev';
};

export async function GET() {
  await connectToDB();
  const rounds = await Round.find({}).sort({ createdAt: -1 }).limit(20);
  return Response.json({ rounds });
}

export async function POST(req) {
  await connectToDB();
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  const { title, linkMappings } = await req.json();
  
  // Validate linkMappings
  if (!linkMappings || linkMappings.length !== 4) {
    return Response.json({ error: 'Must provide exactly 4 link mappings' }, { status: 400 });
  }

  // Validate that all required linkIds are present
  const requiredLinkIds = ['LinkA', 'LinkB', 'LinkC', 'LinkD'];
  const providedLinkIds = linkMappings.map(m => m.linkId);
  if (!requiredLinkIds.every(id => providedLinkIds.includes(id))) {
    return Response.json({ error: 'Must provide mappings for LinkA, LinkB, LinkC, LinkD' }, { status: 400 });
  }

  const round = await Round.create({
    title: title || 'VibeBet Game',
    linkMappings,
    status: 'waiting'
  });

  return Response.json({ success: true, round });
}
