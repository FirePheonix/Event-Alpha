'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ResultsPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [gameId, setGameId] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setGameId(resolvedParams.gameId);
    };
    fetchParams();
  }, [params]);

  useEffect(() => {
    if (!gameId || status === 'loading') return;

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/game/${gameId}/results`);
        const data = await response.json();

        if (response.ok) {
          setResults(data);
        } else {
          setError(data.message || 'Failed to load results');
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [gameId, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading results...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-2xl mb-4">Please sign in to view results</div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    // Special handling for when game hasn't ended yet
    if (error.includes('Results not available yet') || error.includes('wait for the admin')) {
      return (
        <div className="min-h-screen w-full relative overflow-hidden bg-black">
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="/assets/images/background.png"
              alt="Build Wars Background"
              className="object-cover w-full h-full"
              style={{ objectFit: 'cover' }}
            />
          </div>
          
          <div className="relative z-10 flex flex-col justify-center items-center min-h-screen w-full p-8">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-600 max-w-2xl w-full text-center">
              <div className="text-yellow-400 text-3xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-white mb-4">Results Not Available Yet</h2>
              <p className="text-gray-300 mb-6">The admin hasn't ended the game yet. Please wait or go back to the game.</p>
              
              <div className="space-x-4">
                <button
                  onClick={() => router.push(`/game/${gameId}`)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  🎮 Back to Game
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium"
                >
                  🏠 Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-2xl">Error: {error}</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">No results found</div>
      </div>
    );
  }

  const { round, leaderboard, voteDistribution, totalPlayers, totalVotes } = results;
  const userEmail = session?.user?.email;
  const userResult = leaderboard.find(result => result.userEmail === userEmail);

  // Find the tool that corresponds to the most voted link
  const mostVotedLinkMapping = round.linkMappings.find(mapping => mapping.linkId === round.mostVotedLink);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          src="/assets/images/background.png"
          alt="Build Wars Background"
          className="object-cover w-full h-full"
          style={{ objectFit: 'cover' }}
        />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen w-full px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Game Result Section */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Game Result</h2>
            <div className="text-center text-gray-300 mb-4">{round.title}</div>
            
            {/* User Performance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
                <div className="text-sm text-gray-300 mb-1">Your Choices</div>
                <div className="text-white font-bold">Round 1</div>
                <div className="text-sm text-gray-400">Tool</div>
                <div className="mt-2">
                  <span className="bg-gray-700 text-white px-3 py-1 rounded text-sm">
                    {userResult?.round1Choice || 'No choice'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
                <div className="text-sm text-gray-300 mb-1">Your Choices</div>
                <div className="text-white font-bold">Round 2</div>
                <div className="text-sm text-gray-400">Output</div>
                <div className="mt-2">
                  <span className="bg-gray-700 text-white px-3 py-1 rounded text-sm">
                    {userResult?.round2Choice?.replace('Link', 'Option ') || 'No choice'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
                <div className="text-sm text-gray-300 mb-1">Result</div>
                <div className="text-white font-bold">Round 1</div>
                <div className="text-sm text-gray-400">Correct</div>
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded text-sm ${userResult?.breakdown?.toolMatch ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {userResult?.breakdown?.toolMatch ? 'Correct' : 'Wrong'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
                <div className="text-sm text-gray-300 mb-1">Result</div>
                <div className="text-white font-bold">Round 2</div>
                <div className="text-sm text-gray-400">Correct</div>
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded text-sm ${userResult?.breakdown?.mostVotedBonus ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {userResult?.breakdown?.mostVotedBonus ? 'Correct' : 'Wrong'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Good Try Section */}
            {userResult && (
              <div className="mt-6 text-center">
                <div className="inline-block bg-blue-600/20 border border-blue-400/30 rounded-lg px-6 py-3">
                  <div className="text-yellow-400 font-bold text-lg mb-1">🏆 Good Try!</div>
                  <div className="text-white">You earned: <span className="font-bold text-yellow-400">{userResult.pointsEarned || 0} points</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Output Result Section */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Output Result</h2>
            
            {/* Challenge Info */}
            <div className="mb-6 text-center">
              <div className="text-sm text-gray-300 mb-2">Prompt used:</div>
              <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                <div className="text-gray-300 italic">"{round.title}"</div>
              </div>
            </div>
            
            {/* Winners and Vote Distribution */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {round.linkMappings.map((mapping) => {
                const votes = voteDistribution[mapping.linkId] || 0;
                const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
                const isWinner = mapping.linkId === round.mostVotedLink;
                
                return (
                  <div 
                    key={mapping.linkId}
                    className={`bg-white/10 rounded-lg p-4 text-center border ${
                      isWinner ? 'border-green-400 bg-green-500/20' : 'border-white/20'
                    } backdrop-blur-sm`}
                  >
                    {/* Image placeholder */}
                    <div className="aspect-video bg-white/10 rounded mb-3 flex items-center justify-center">
                      <div className="text-gray-400 text-xs">Output Preview</div>
                    </div>
                    
                    <div className="text-lg font-bold text-white mb-1">Option {mapping.linkId.replace('Link', '')}</div>
                    <div className="text-sm text-gray-300 mb-2">{mapping.tool}</div>
                    <div className="text-sm text-gray-400">{votes} votes ({percentage}%)</div>
                    {isWinner && <div className="text-green-400 text-sm mt-1 font-bold">👑 Winner</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Final Rankings */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Final Rankings</h2>
            
            {/* User Rank and Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
                <div className="text-gray-300 text-sm mb-1">Your Rank</div>
                <div className="text-white text-2xl font-bold">
                  #{userResult ? (leaderboard.findIndex(r => r.userEmail === userEmail) + 1) : 'N/A'}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center border border-white/20">
                <div className="text-gray-300 text-sm mb-1">Your Score</div>
                <div className="text-white text-2xl font-bold">{userResult?.pointsEarned || 0} Pts</div>
              </div>
            </div>
            
            {/* Leaderboard List */}
            {leaderboard && leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((result, index) => (
                  <div 
                    key={result.userEmail} 
                    className={`bg-white/10 rounded-lg p-4 border backdrop-blur-sm ${
                      result.userEmail === userEmail ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' : 
                          index === 1 ? 'bg-gray-400 text-black' : 
                          index === 2 ? 'bg-orange-500 text-black' : 'bg-gray-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {result.userEmail === userEmail ? 'You' : result.userEmail.split('@')[0]}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-yellow-400">+{result.pointsEarned || 0}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-4xl mb-4">📊</div>
                <p>No players have completed the game yet.</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="text-center space-y-4">
            <div className="space-x-4">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                🏠 Home
              </button>
              <button
                onClick={() => router.push(`/game/${gameId}`)}
                className="px-6 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition backdrop-blur-sm border border-white/30"
              >
                🎮 Back to Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
