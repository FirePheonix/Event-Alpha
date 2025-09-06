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
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            🏆 VibeBet Results
          </h1>
          <h2 className="text-2xl text-gray-300 mb-2">{round.title}</h2>
          <div className="text-gray-400">
            Game Status: <span className="text-green-400 font-semibold">{round.status.toUpperCase()}</span>
          </div>
        </div>

        {/* Most Voted Link Winner */}
        {round.mostVotedLink && (
          <div className="bg-gradient-to-r from-purple-900 to-pink-900 border border-purple-500 rounded-xl p-6 mb-8 text-center">
            <h3 className="text-3xl font-bold mb-2">🎯 Most Voted Link</h3>
            <div className="text-6xl mb-2">{round.mostVotedLink}</div>
            <div className="text-2xl text-yellow-400 font-bold">
              Tool: {mostVotedLinkMapping?.tool || 'Unknown'}
            </div>
            <div className="text-gray-300 mt-2">
              Votes: {voteDistribution[round.mostVotedLink] || 0} out of {totalVotes}
            </div>
          </div>
        )}

        {/* User's Performance */}
        {userResult ? (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center">📊 Your Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-2">Your Choices</h4>
                <div className="space-y-2">
                  <div>Round 1 (Tool): <span className="font-bold text-blue-400">{userResult.round1Choice || 'No choice'}</span></div>
                  <div>Round 2 (Link): <span className="font-bold text-purple-400">{userResult.round2Choice || 'No choice'}</span></div>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold mb-2">Points Breakdown</h4>
                <div className="space-y-2">
                  <div className={`${userResult.breakdown?.toolMatch ? 'text-green-400' : 'text-red-400'}`}>
                    Tool Match: {userResult.breakdown?.toolMatch ? '✅ +30 points' : '❌ +0 points'}
                  </div>
                  <div className={`${userResult.breakdown?.mostVotedBonus ? 'text-green-400' : 'text-red-400'}`}>
                    Most Voted Link: {userResult.breakdown?.mostVotedBonus ? '✅ +100 points' : '❌ +0 points'}
                  </div>
                  <div className="text-xl font-bold text-yellow-400 pt-2 border-t border-gray-600">
                    Total: {userResult.pointsEarned || 0} points
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center">📊 Your Performance</h3>
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-4">🤔</div>
              <p>You haven't participated in this game yet.</p>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-3xl font-bold mb-6 text-center">🏅 Leaderboard</h3>
          {leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((result, index) => (
                <div 
                  key={result.userEmail} 
                  className={`bg-gray-800 rounded-lg p-4 border ${
                    result.userEmail === userEmail ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl font-bold ${
                        index === 0 ? 'text-yellow-400' : 
                        index === 1 ? 'text-gray-300' : 
                        index === 2 ? 'text-orange-400' : 'text-gray-500'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {result.userEmail === userEmail ? 'You' : result.userEmail.split('@')[0]}
                        </div>
                        <div className="text-sm text-gray-400">
                          {result.round1Choice || 'No choice'} → {result.round2Choice || 'No choice'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-400">
                        {result.pointsEarned || 0} pts
                      </div>
                      <div className="text-xs text-gray-400">
                        {result.breakdown?.toolMatch && '🎯'} {result.breakdown?.mostVotedBonus && '🏆'}
                      </div>
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

        {/* Vote Distribution */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-bold mb-4 text-center">📈 Vote Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {round.linkMappings.map((mapping) => {
              const votes = voteDistribution[mapping.linkId] || 0;
              const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
              const isWinner = mapping.linkId === round.mostVotedLink;
              
              return (
                <div 
                  key={mapping.linkId}
                  className={`bg-gray-800 rounded-lg p-4 text-center border ${
                    isWinner ? 'border-yellow-500 bg-yellow-900/20' : 'border-gray-600'
                  }`}
                >
                  <div className={`text-2xl font-bold ${isWinner ? 'text-yellow-400' : 'text-white'}`}>
                    {mapping.linkId}
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{mapping.tool}</div>
                  <div className="text-lg font-semibold">{votes} votes</div>
                  <div className="text-sm text-gray-400">{percentage}%</div>
                  {isWinner && <div className="text-yellow-400 text-sm mt-1">👑 Winner</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Link Mappings */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-bold mb-4 text-center">🔗 Link Mappings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {round.linkMappings.map((mapping) => (
              <div key={mapping.linkId} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-lg">{mapping.linkId}</span>
                  <span className="text-blue-400 font-semibold">{mapping.tool}</span>
                </div>
                {mapping.description && (
                  <p className="text-gray-400 text-sm">{mapping.description}</p>
                )}
              </div>
            ))}
          </div>
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
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
            >
              🎮 Back to Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
