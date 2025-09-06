"use client";
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Home = () => {
  const { data: session, status } = useSession();
  const [rounds, setRounds] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // Check if user is admin
  const isAdmin = session?.user?.email === 'shubhsoch@gmail.com' || session?.user?.email === 'rohan@dualite.dev';

  // Helper functions for status display
  const getStatusColor = (status) => {
    switch(status) {
      case 'waiting': return 'text-gray-400';
      case 'active': return 'text-green-400';
      case 'ended': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'waiting': return 'WAITING TO START';
      case 'active': return 'GAME ACTIVE';
      case 'ended': return 'GAME ENDED';
      default: return status.toUpperCase();
    }
  };

  useEffect(() => {
    if (session) {
      // Fetch rounds
      fetch('/api/admin/rounds')
        .then(res => res.json())
        .then(data => setRounds(data.rounds || []))
        .catch(err => console.error('Error fetching rounds:', err));
      
      // Fetch global leaderboard and user stats
      fetch('/api/leaderboard')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserStats(data.userStats);
            setGlobalLeaderboard(data.globalLeaderboard);
          }
          setLeaderboardLoading(false);
        })
        .catch(err => {
          console.error('Error fetching leaderboard:', err);
          setLeaderboardLoading(false);
        });
    }
  }, [session]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <h1 className="text-4xl font-bold mb-6 text-white">Welcome to VibeBet</h1>
        <p className="mb-8 text-lg text-gray-300">Log in to play, vote, and climb the leaderboard!</p>
        <button
          className="px-6 py-3 bg-white text-black rounded-lg font-semibold text-xl shadow hover:bg-gray-200 transition duration-200"
          onClick={() => signIn('google')}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-black text-white pt-10">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-extrabold mb-4 text-white">
          VibeBet
        </h1>
        <p className="text-xl text-gray-300 mb-2">The Ultimate Coding Tool Prediction Game</p>
        <p className="text-lg text-gray-400">Guess → Vote → Win Points!</p>
      </div>
      
      {/* User Points Display */}
      {session && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-300">Your Total Points</p>
            {leaderboardLoading ? (
              <p className="text-3xl font-bold text-white">🏆 Loading...</p>
            ) : (
              <div>
                <p className="text-3xl font-bold text-yellow-400">{userStats?.totalPoints || 0} pts</p>
                <div className="text-sm text-gray-400 mt-1">
                  {userStats?.gamesPlayed || 0} games played • Rank #{userStats?.rank || 'Unranked'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-8 flex gap-4">
        <Link href="/leaderboard" className="px-6 py-3 bg-white text-black rounded-lg font-bold shadow-lg hover:bg-gray-200 transform hover:scale-105 transition duration-200">
          🏆 Leaderboard
        </Link>
        {isAdmin && (
          <Link href="/admin/dashboard" className="px-6 py-3 bg-gray-800 border border-gray-600 rounded-lg font-bold text-white shadow-lg hover:bg-gray-700 transform hover:scale-105 transition duration-200">
            🔐 Admin Dashboard
          </Link>
        )}
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 text-white">🎮 How to Play VibeBet</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold mb-2 text-white">ROUND 1: Quick Choice (30s)</h3>
            <p className="text-gray-300">Choose between Dualite, Lovable, Bolt, or V0. You have only 30 seconds!</p>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="text-4xl mb-3">�</div>
            <h3 className="text-xl font-bold mb-2 text-white">ROUND 2: Link Selection</h3>
            <p className="text-gray-300">Vote for LinkA, LinkB, LinkC, or LinkD. Each link is secretly mapped to a tool!</p>
          </div>
        </div>
        <div className="mt-6 bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="text-xl font-bold mb-2 text-white">SCORING SYSTEM</h3>
          <p className="text-gray-300 mb-2">• If your Round 1 choice matches your Round 2 link: <span className="text-green-400 font-bold">30 points</span></p>
          <p className="text-gray-300">• If your Round 1 choice matches the MOST VOTED link: <span className="text-yellow-400 font-bold">100 points</span></p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6 text-white">� Global Leaderboard</h2>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8 w-full max-w-4xl">
        {leaderboardLoading ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">⏳</div>
            <p>Loading leaderboard...</p>
          </div>
        ) : globalLeaderboard.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">🏅</div>
            <p>No players on the leaderboard yet!</p>
            <p className="text-sm mt-2">Be the first to play and earn points!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-center mb-4 text-yellow-400">Top Players</h3>
            {globalLeaderboard.slice(0, 10).map((player, index) => (
              <div 
                key={player.userEmail}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  player.userEmail === session?.user?.email 
                    ? 'bg-yellow-900/30 border border-yellow-600' 
                    : 'bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' : 
                    index === 1 ? 'bg-gray-400 text-black' : 
                    index === 2 ? 'bg-orange-500 text-black' : 'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {player.userEmail === session?.user?.email ? 'You' : player.userEmail.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-400">
                      {player.gamesPlayed} games • {player.averagePoints} avg
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-yellow-400">{player.totalPoints} pts</div>
                </div>
              </div>
            ))}
            {globalLeaderboard.length > 10 && (
              <div className="text-center pt-3">
                <Link 
                  href="/leaderboard" 
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  View Full Leaderboard ({globalLeaderboard.length} players)
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-6 text-white">�🎯 Live Games</h2>
      <div className="grid grid-cols-1 gap-6 w-full max-w-4xl px-4">
        {rounds.length === 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🎲</div>
            <p className="text-xl text-gray-300">No active games right now...</p>
            <p className="text-gray-400 mt-2">Check back soon for the next VibeBet challenge!</p>
          </div>
        )}
        {rounds.map(round => (
          <div key={round._id} className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-6 hover:bg-gray-800 transition duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{round.title || `Game #${round._id.slice(-6)}`}</h3>
                <p className="text-gray-300">Status: <span className={`font-semibold ${getStatusColor(round.status)}`}>{getStatusText(round.status)}</span></p>
                {round.status === 'active' && (
                  <p className="text-green-400 font-bold animate-pulse">🎮 Game is Live - Join Now!</p>
                )}
                {round.mostVotedLink && <p className="text-gray-300">Most Voted: <span className="font-bold text-white">{round.mostVotedLink}</span></p>}
              </div>
            </div>
            
            <div className="flex gap-3 mb-4">
              {round.status === 'waiting' && (
                <div className="px-4 py-2 bg-gray-700 text-gray-400 rounded font-semibold text-center">
                  ⏳ Waiting to Start
                </div>
              )}
              {round.status === 'active' && (
                <Link 
                  href={`/game/${round._id}`} 
                  className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition transform hover:scale-105 shadow-lg"
                >
                  🎮 Join Game
                </Link>
              )}
              {round.status === 'ended' && (
                <Link 
                  href={`/game/${round._id}/results`} 
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition transform hover:scale-105 shadow-lg"
                >
                  📊 View Results
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-gray-400 text-sm">© 2025 VibeBet - The Future of Coding Tool Prediction</p>
      </div>
    </div>
  );
}

export default Home;