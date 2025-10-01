import { connectToDB } from '@utils/database';
import Round from '@models/round';
import Guess from '@models/guess';
import Vote from '@models/vote';

export async function GET(request, { params }) {
  const { gameId } = await params;

  try {
    await connectToDB();

    // Get the round
    const round = await Round.findById(gameId);
    if (!round) {
      return new Response(JSON.stringify({ message: 'Round not found' }), { status: 404 });
    }

    // Check if game has ended - results should only be accessible after admin ends the game
    if (round.status !== 'ended') {
      return new Response(JSON.stringify({ 
        message: 'Results not available yet. Please wait for the admin to end the game.' 
      }), { 
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Fetching results for round ${gameId}, status: ${round.status}`);

    // Calculate most voted link if not already calculated
    let mostVotedLink = round.mostVotedLink;
    if (!mostVotedLink) {
      const voteCounts = {};
      const votes = await Vote.find({ round: gameId });
      
      console.log(`Found ${votes.length} votes for calculating most voted link`);
      
      votes.forEach(vote => {
        if (vote.linkChoice) {
          voteCounts[vote.linkChoice] = (voteCounts[vote.linkChoice] || 0) + 1;
        }
      });

      // Find the link with most votes
      let maxVotes = 0;
      let winningLink = null;
      for (const [link, count] of Object.entries(voteCounts)) {
        if (count > maxVotes) {
          maxVotes = count;
          winningLink = link;
        }
      }

      mostVotedLink = winningLink;
      
      console.log(`Most voted link: ${mostVotedLink} with ${maxVotes} votes`);
      
      // Update round with most voted link
      if (winningLink) {
        await Round.findByIdAndUpdate(gameId, { mostVotedLink: winningLink });
      }
    }

    // Get all guesses for this round
    const guesses = await Guess.find({ round: gameId });
    
    console.log(`Found ${guesses.length} guesses to calculate points for`);
    
    // Calculate points for each user
    const leaderboard = [];
    
    for (const guess of guesses) {
      let points = 0;
      let breakdown = {
        toolMatch: false,
        mostVotedBonus: false,
        toolMatchPoints: 0,
        mostVotedPoints: 0
      };

      console.log(`Calculating points for user ${guess.userEmail}: R1=${guess.round1Choice}, R2=${guess.round2Choice}`);

      if (guess.round1Choice && guess.round2Choice) {
        // Find which tool corresponds to the user's round2Choice (link)
        const linkMapping = round.linkMappings.find(mapping => mapping.linkId === guess.round2Choice);
        
        if (linkMapping) {
          console.log(`Link ${guess.round2Choice} maps to tool ${linkMapping.tool}`);
          
          // Check if user's tool choice matches the link's tool (30 points)
          if (guess.round1Choice === linkMapping.tool) {
            points += 30;
            breakdown.toolMatch = true;
            breakdown.toolMatchPoints = 30;
            console.log(`✅ Tool match! User gets 30 points`);
            
            // ONLY give 100 bonus points if they ALSO picked the most voted link
            // (This means they correctly guessed the tool AND picked the winning link)
            if (guess.round2Choice === mostVotedLink) {
              points += 100;
              breakdown.mostVotedBonus = true;
              breakdown.mostVotedPoints = 100;
              console.log(`🏆 Most voted link bonus! User gets additional 100 points`);
            }
          } else {
            console.log(`❌ No tool match. User chose ${guess.round1Choice}, but link maps to ${linkMapping.tool}`);
          }
          // If they didn't get the tool match right, they get 0 points regardless of most voted link
        } else {
          console.log(`⚠️ No mapping found for link ${guess.round2Choice}`);
        }
      } else {
        console.log(`⚠️ User has incomplete choices: R1=${guess.round1Choice}, R2=${guess.round2Choice}`);
      }

      console.log(`Final points for ${guess.userEmail}: ${points}`);

      // Update the guess with calculated points
      await Guess.findByIdAndUpdate(guess._id, { pointsEarned: points });

      leaderboard.push({
        userEmail: guess.userEmail,
        round1Choice: guess.round1Choice,
        round2Choice: guess.round2Choice,
        pointsEarned: points,
        breakdown: breakdown,
        round1CompletedAt: guess.round1CompletedAt,
        round2CompletedAt: guess.round2CompletedAt
      });
    }

    // Sort leaderboard by points (highest first)
    leaderboard.sort((a, b) => b.pointsEarned - a.pointsEarned);

    // Get vote distribution
    const votes = await Vote.find({ round: gameId });
    const voteDistribution = {};
    votes.forEach(vote => {
      if (vote.linkChoice) {
        voteDistribution[vote.linkChoice] = (voteDistribution[vote.linkChoice] || 0) + 1;
      }
    });

    return new Response(JSON.stringify({
      success: true,
      round: {
        _id: round._id,
        title: round.title,
        status: round.status,
        linkMappings: round.linkMappings,
        mostVotedLink: mostVotedLink,
        endedAt: round.endedAt
      },
      leaderboard: leaderboard,
      voteDistribution: voteDistribution,
      totalPlayers: guesses.length,
      totalVotes: votes.length
    }), { status: 200 });

  } catch (error) {
    console.error('Error fetching results:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
