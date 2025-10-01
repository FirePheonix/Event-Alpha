"use client";
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { RetroGrid } from "@/components/ui/retro-grid";

const Home = () => {
  const { data: session, status } = useSession();
  const [rounds, setRounds] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [gameHistory, setGameHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [roundPlayerCounts, setRoundPlayerCounts] = useState({});

  const isAdmin = session?.user?.email === 'shubhsoch@gmail.com' || session?.user?.email === 'Rohan@dualite.dev';

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
        .then(data => {
          const rounds = data.rounds || [];
          setRounds(rounds);
          
          // Fetch player counts for each round
          rounds.forEach(round => {
            fetch(`/api/game/${round._id}`)
              .then(res => res.json())
              .then(gameData => {
                if (gameData.lobbyPlayers) {
                  setRoundPlayerCounts(prev => ({
                    ...prev,
                    [round._id]: gameData.lobbyPlayers.count
                  }));
                }
              })
              .catch(err => console.error(`Error fetching player count for round ${round._id}:`, err));
          });
        })
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
      
      // Fetch user game history
      fetch('/api/user/game-history')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setGameHistory(data.gameHistory);
          }
          setHistoryLoading(false);
        })
        .catch(err => {
          console.error('Error fetching game history:', err);
          setHistoryLoading(false);
        });
    }
  }, [session]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000', color: '#ffffff' }}>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-black">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image 
            src="/assets/images/home-bg.png"
            alt="Build Wars Background"
            fill
            className="object-cover w-full h-full"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full p-8">
          {/* BuildWars Logo */}
          <div className="mb-8">
            <Image
              src="/assets/images/logo-BuildWars.png"
              alt="BuildWars"
              width={300}
              height={100}
              className="object-contain"
            />
          </div>
          
          {/* Subtitle */}
          <p className="text-white text-lg mb-4 text-center">The ultimate coding tool battle arena</p>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-bold italic text-white mb-6 text-center tracking-wide" 
              style={{ fontFamily: 'serif' }}>
            Welcome to Build Wars
          </h1>
          
          {/* Divider Line */}
          <div className="w-64 h-0.5 bg-white mb-8"></div>
          
          {/* Description */}
          <p className="text-gray-300 text-lg mb-12 text-center max-w-md">
            Log in to play, vote, and climb the leaderboard!
          </p>
          
          {/* Sign In Button */}
          <button
            className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg shadow-lg hover:bg-gray-100 transition duration-200"
            onClick={() => signIn('google')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          
          {/* Footer Text */}
          <p className="text-gray-400 text-sm mt-12 text-center">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
      {/* Hero Section with Background */}
      <div className="relative w-full min-h-[120vh] flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: '#000000', paddingTop: '120px', paddingBottom: '80px' }}>
        <Image 
          src="/assets/images/background.png"
          alt="Build Wars Background"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <h1 className="awesome-serif-italic-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-2 sm:mb-4 leading-tight" style={{ color: '#ffffff' }}>
            A Vibe-coding showdown like never before.
          </h1>
          <p className="text-xs sm:text-sm mb-6 sm:mb-8" style={{ color: '#888888' }}>Guess → Vote → Win Points!</p>
          
          {/* How to Play Section */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/10 max-w-3xl w-full mx-auto shadow-lg">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="text-lg sm:text-xl">🎮</span>
              <h2 className="awesome-serif-italic text-base sm:text-lg lg:text-xl font-bold" style={{ color: '#ffffff' }}>How to Play BuildWars</h2>
            </div>
            
            <div className="space-y-4">
              {/* Rounds 1 and 2 in horizontal row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Round 1 */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-500/70 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-bold text-sm backdrop-blur-sm">1</span>
                    <h3 className="awesome-serif-italic text-sm sm:text-base font-bold" style={{ color: '#ffffff' }}>ROUND 1: Choose Your Tool</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#e5e5e5' }}>
                    Choose which AI coding tool (Dualite, v0, Bolt, or Lovable) you think will perform best. You have 30 seconds to decide!
                  </p>
                </div>
                
                {/* Round 2 */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-purple-500/70 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-bold text-sm backdrop-blur-sm">2</span>
                    <h3 className="awesome-serif-italic text-sm sm:text-base font-bold" style={{ color: '#ffffff' }}>ROUND 2: Vote & Guess</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#e5e5e5' }}>
                    View 4 AI-generated outputs and guess which one matches your chosen tool. You have 60 seconds to analyze and vote!
                  </p>
                </div>
              </div>
              
              {/* Win Points - Full width below */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-yellow-500/70 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-bold text-sm backdrop-blur-sm">🏆</span>
                  <h3 className="awesome-serif-italic text-sm sm:text-base font-bold" style={{ color: '#ffffff' }}>Win Points</h3>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#e5e5e5' }}>
                  Earn 100 points for perfect matches, 30 points for correct tool guesses. Climb the leaderboard and become the ultimate BuildWars champion!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Active Game Sessions Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16" style={{ backgroundColor: '#000000' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="awesome-serif-italic-bold text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-4 text-center" style={{ color: '#ffffff' }}>Active game sessions</h2>
          <p className="text-center mb-8 sm:mb-12 text-sm sm:text-base" style={{ color: '#888888' }}>Battle your way to the top.</p>
          
          {rounds.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-700">
                <h3 className="awesome-serif-italic text-lg sm:text-xl lg:text-2xl mb-2" style={{ color: '#ffffff' }}>Game Not Started</h3>
                <p className="mb-4 text-sm sm:text-base" style={{ color: '#888888' }}>Wait for a session to start</p>
                <button className="bg-gray-700 text-gray-400 px-4 sm:px-6 py-2 rounded-lg cursor-not-allowed text-sm sm:text-base">
                  Join Game
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {rounds.map((round, index) => (
              <div key={round._id} className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 transition-all hover:border-purple-500/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h3 className="awesome-serif-italic text-lg sm:text-xl" style={{ color: '#ffffff' }}>
                      # {round.status === 'waiting' ? 'No Active Game' : `Session ${index + 1}`}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-xs sm:text-sm" style={{ color: '#888888' }}>👥 {roundPlayerCounts[round._id] || 0} Players Joined Round 1</span>
                      <span className={`px-2 py-1 rounded text-xs self-start ${
                        round.status === 'active' ? 'bg-green-600 text-white' : 
                        round.status === 'waiting' ? 'bg-yellow-600 text-white' : 
                        'bg-red-600 text-white'
                      }`}>
                        {round.status === 'active' ? '● In Lobby' : 
                         round.status === 'waiting' ? '● Wait for a session to start' : 
                         '● Finished'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {round.status === 'active' && (
                      <Link 
                        href={`/game/${round._id}`} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base"
                      >
                        Join Game
                      </Link>
                    )}
                    {round.status === 'waiting' && (
                      <button className="bg-gray-700 text-gray-400 px-4 sm:px-6 py-2 rounded-lg cursor-not-allowed text-sm sm:text-base">
                        Join Game
                      </button>
                    )}
                    {round.status === 'ended' && (
                      <Link 
                        href={`/game/${round._id}/results`} 
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base"
                      >
                        View Results
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game History Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 border-t border-gray-800" style={{ backgroundColor: '#000000' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="awesome-serif-italic-bold text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-4 text-center" style={{ color: '#ffffff' }}>Your Game History</h2>
          <p className="text-center mb-8 sm:mb-12 text-sm sm:text-base" style={{ color: '#888888' }}>Your recent gaming sessions and performance.</p>
          
          {historyLoading ? (
            <div className="text-center py-8">
              <div className="text-white">Loading game history...</div>
            </div>
          ) : gameHistory.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-700">
                <h3 className="awesome-serif-italic text-lg sm:text-xl lg:text-2xl mb-2" style={{ color: '#ffffff' }}>No Games Played Yet</h3>
                <p className="mb-4 text-sm sm:text-base" style={{ color: '#888888' }}>Join your first game to start building your history!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {gameHistory.map((game, index) => {
                const gameDate = new Date(game.completedAt);
                const isToday = gameDate.toDateString() === new Date().toDateString();
                const isYesterday = gameDate.toDateString() === new Date(Date.now() - 86400000).toDateString();
                
                let dateLabel;
                if (isToday) {
                  dateLabel = `Today: ${gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                } else if (isYesterday) {
                  dateLabel = `Yesterday: ${gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                } else {
                  dateLabel = gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                }
                
                return (
                  <div key={game.gameId} className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <h3 className="awesome-serif-italic text-lg sm:text-xl" style={{ color: '#ffffff' }}>
                          {dateLabel}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="text-xs sm:text-sm" style={{ color: '#888888' }}>
                            {game.gameTitle} • {game.userRound1Choice || 'No tool'} → {game.userRound2Choice?.replace('Link', 'Option ') || 'No choice'}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              game.pointsEarned > 100 ? 'bg-green-600/20 text-green-400' :
                              game.pointsEarned > 0 ? 'bg-yellow-600/20 text-yellow-400' :
                              'bg-gray-600/20 text-gray-400'
                            }`}>
                              +{game.pointsEarned} pts
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                game.gameStatus === 'ended' ? 'bg-red-400' : 'bg-green-400'
                              }`}></span>
                              <span className={`text-xs sm:text-sm font-medium ${
                                game.gameStatus === 'ended' ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {game.gameStatus === 'ended' ? 'Finished' : 'Active'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {game.gameStatus === 'ended' && (
                          <Link 
                            href={`/game/${game.gameId}/results`}
                            className="bg-yellow-600 hover:bg-yellow-700 text-black px-4 sm:px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base self-start sm:self-auto"
                          >
                            View Results
                          </Link>
                        )}
                        {game.gameStatus === 'active' && (
                          <Link 
                            href={`/game/${game.gameId}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base self-start sm:self-auto"
                          >
                            Continue Game
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 sm:mt-12 text-center pb-6 sm:pb-8 px-4">
        <p className="text-xs sm:text-sm" style={{ color: '#ffffff' }}>© 2025 Build Wars - The Future of Coding Tool Prediction</p>
      </div>
    </div>
  );
}

export default Home;