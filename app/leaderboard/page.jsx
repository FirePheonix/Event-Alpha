'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image 
          src="/assets/images/background.png"
          alt="Build Wars Background"
          fill
          className="object-cover w-full h-full"
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen w-full p-8">
        {/* Main Container */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-600 max-w-4xl w-full">
          {/* Title */}
          <h1 className="text-4xl font-bold text-white text-center mb-8 italic" style={{ fontFamily: 'serif' }}>
            Final Rankings
          </h1>

          {/* User Stats Row */}
          <div className="flex justify-center mb-8">
            {/* Your Rank */}
            <div className="w-full max-w-md">
              <h3 className="text-lg text-white mb-3">Your Rank</h3>
              <div className="bg-gray-800/80 border border-gray-600 rounded-xl p-4">
                <div className="text-yellow-400 font-bold text-lg">
                  #{userStats?.rank || 1} out of {globalLeaderboard.length} Players
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="space-y-3">
            {globalLeaderboard.length === 0 ? (
              // Mock data for demonstration
              [
                { userEmail: 'cyberwarrior26@example.com', totalPoints: 100, rank: 1 },
                { userEmail: 'player2@example.com', totalPoints: 100, rank: 2 },
                { userEmail: 'player3@example.com', totalPoints: 90, rank: 3 },
                { userEmail: 'player4@example.com', totalPoints: 60, rank: 4 },
                { userEmail: 'player5@example.com', totalPoints: 30, rank: 5 }
              ].map((player, index) => (
                <div 
                  key={player.userEmail}
                  className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-600 flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-green-500 text-black' : 
                      index === 1 ? 'bg-yellow-500 text-black' : 
                      index === 2 ? 'bg-gray-300 text-black' : 'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Avatar and Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                        S
                      </div>
                      <div>
                        <div className="text-white font-medium text-lg">
                          {player.userEmail === session?.user?.email ? 'You' : 'Cyberwarrior26'}
                        </div>
                        <div className="text-gray-400 text-sm">1250 Points</div>
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className={`font-bold text-lg ${
                    index === 0 ? 'text-green-400' :
                    index === 1 ? 'text-green-400' :
                    index === 2 ? 'text-green-400' :
                    index === 3 ? 'text-green-400' : 'text-green-400'
                  }`}>
                    +{player.totalPoints}
                  </div>
                </div>
              ))
            ) : (
              globalLeaderboard.map((player, index) => (
                <div 
                  key={player.userEmail}
                  className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 border border-gray-600 flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-green-500 text-black' : 
                      index === 1 ? 'bg-yellow-500 text-black' : 
                      index === 2 ? 'bg-gray-300 text-black' : 'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Avatar and Name */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                        {(player.userEmail.charAt(0) || 'S').toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium text-lg">
                          {player.userEmail === session?.user?.email ? 'You' : player.userEmail.split('@')[0]}
                        </div>
                        <div className="text-gray-400 text-sm">{player.totalPoints} Points</div>
                      </div>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-green-400 font-bold text-lg">
                    +{player.totalPoints}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Navigation */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
