'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Leaderboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGlobalLeaderboard(data.globalLeaderboard || []);
          setUserStats(data.userStats);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching leaderboard:', err);
        setLoading(false);
      });
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-white">Loading leaderboard...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-2xl mb-4">Please sign in to view leaderboard</div>
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

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent">
            🏆 Global Leaderboard
          </h1>
          <p className="text-gray-300 text-lg">Top VibeBet players across all games</p>
        </div>

        {/* User's Stats */}
        {userStats && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-bold mb-4 text-center">📊 Your Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{userStats.totalPoints}</div>
                <div className="text-gray-400 text-sm">Total Points</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">#{userStats.rank || 'Unranked'}</div>
                <div className="text-gray-400 text-sm">Global Rank</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{userStats.gamesPlayed}</div>
                <div className="text-gray-400 text-sm">Games Played</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{userStats.averagePoints}</div>
                <div className="text-gray-400 text-sm">Average Points</div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-3xl font-bold mb-6 text-center">🏅 All Players</h3>
          {globalLeaderboard.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-4">🏅</div>
              <p>No players on the leaderboard yet!</p>
              <p className="text-sm mt-2">Be the first to play and earn points!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {globalLeaderboard.map((player, index) => (
                <div 
                  key={player.userEmail}
                  className={`flex justify-between items-center p-4 rounded-lg border ${
                    player.userEmail === session?.user?.email 
                      ? 'bg-yellow-900/30 border-yellow-600' 
                      : 'bg-gray-800 border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-yellow-500 text-black' : 
                      index === 1 ? 'bg-gray-400 text-black' : 
                      index === 2 ? 'bg-orange-500 text-black' : 'bg-gray-600 text-white'
                    }`}>
                      {index === 0 ? '👑' : index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {player.userEmail === session?.user?.email ? 'You' : player.userEmail.split('@')[0]}
                      </div>
                      <div className="text-sm text-gray-400">
                        {player.gamesPlayed} games played • {player.averagePoints} avg points
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">{player.totalPoints} pts</div>
                    <div className="text-sm text-gray-400">
                      {index < 3 && (
                        <span className="text-yellow-400">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} Top 3
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
