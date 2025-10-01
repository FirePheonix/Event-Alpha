'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function GamePage(props) {
  const params = React.use(props.params);
  const gameId = params.gameId;
  const { data: session } = useSession();
  const router = useRouter();
  const [game, setGame] = useState(null);
  const [userGuess, setUserGuess] = useState(null);
  const [lobbyPlayers, setLobbyPlayers] = useState({ count: 0, emails: [] });
  const [timeLeft, setTimeLeft] = useState(30); // Start with 30 seconds for Round 1
  const [round2TimeLeft, setRound2TimeLeft] = useState(60); // 60 seconds for Round 2
  const [currentRound, setCurrentRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [round1Started, setRound1Started] = useState(false);
  const [round2Started, setRound2Started] = useState(false);
  const [round1Choice, setRound1Choice] = useState(null); // Track current round 1 choice
  const [round2Choice, setRound2Choice] = useState(null); // Track current round 2 choice

  useEffect(() => {
    if (!session) {
      router.push('/');
      return;
    }
    fetchGame();
  }, [session, gameId]);

  // Timer for Round 1 (starts when user enters Round 1)
  useEffect(() => {
    if (round1Started && currentRound === 1 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, round1Started, currentRound]);

  // Timer for Round 2 (auto-starts when entering Round 2)
  useEffect(() => {
    if (currentRound === 2 && round2TimeLeft > 0) {
      const timer = setTimeout(() => setRound2TimeLeft(round2TimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [round2TimeLeft, currentRound]);

  // Auto-start Round 2 timer when entering Round 2
  useEffect(() => {
    if (currentRound === 2 && !round2Started) {
      setRound2Started(true);
      setRound2TimeLeft(60); // Reset to 60 seconds
    }
  }, [currentRound, round2Started]);

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/game/${gameId}`);
      const data = await response.json();
      setGame(data.game);
      setUserGuess(data.userGuess);
      setLobbyPlayers(data.lobbyPlayers || { count: 0, emails: [] });
      
      // Set user's existing choices
      if (data.userGuess) {
        setRound1Choice(data.userGuess.round1Choice);
        setRound2Choice(data.userGuess.round2Choice);
        
        // Determine which round user should be on
        if (data.userGuess.round1Choice && !data.userGuess.round2Choice) {
          setCurrentRound(2); // User completed Round 1, show Round 2
        } else if (data.userGuess.round1Choice && data.userGuess.round2Choice) {
          // Check if game has ended
          if (data.game.status === 'ended') {
            setCurrentRound(4); // Show results available state
          } else {
            setCurrentRound(3); // User completed both rounds, show waiting screen
          }
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game:', error);
      setLoading(false);
    }
  };

  const startRound1Timer = () => {
    setRound1Started(true);
    setTimeLeft(30);
  };

  const makeRound1Choice = (tool) => {
    setRound1Choice(tool); // Store the choice locally only
  };

  const submitRound1Choice = async () => {
    if (!round1Choice) return;

    try {
      const response = await fetch(`/api/game/${gameId}/round1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: round1Choice })
      });

      if (response.ok) {
        // Automatically move to round 2 after successful submission
        setCurrentRound(2);
      } else {
        const errorData = await response.json();
        console.error('Round 1 choice error:', errorData);
        alert(`Error: ${errorData.error || 'Failed to save choice'}`);
      }
    } catch (error) {
      console.error('Error making Round 1 choice:', error);
      alert('Network error occurred');
    }
  };

  const selectRound2Choice = (link) => {
    setRound2Choice(link); // Just store locally, don't submit yet
  };

  const submitRound2Choice = async () => {
    if (!round2Choice) return;

    try {
      const response = await fetch(`/api/game/${gameId}/round2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: round2Choice })
      });

      if (response.ok) {
        // Move to waiting for results screen after completing Round 2
        setCurrentRound(3);
      } else {
        const errorData = await response.json();
        console.error('Round 2 choice error:', errorData);
        alert(`Error: ${errorData.error || 'Failed to save choice'}`);
      }
    } catch (error) {
      console.error('Error making Round 2 choice:', error);
      alert('Network error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-400 text-xl">Game not found</div>
      </div>
    );
  }

  // Render based on current round and game status
  if (game?.status === 'waiting') {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Game Starting Soon</h1>
          <p className="text-xl mb-4">Waiting for admin to start the game...</p>
          <div className="text-gray-400">Game ID: {gameId}</div>
        </div>
      </div>
    );
  }

  if (game?.status === 'ended') {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Game Ended</h1>
          <p className="text-xl mb-4">This game has concluded.</p>
          <a
            href={`/game/${gameId}/results`}
            className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition inline-block"
          >
            📊 View Results
          </a>
          <div className="text-gray-400 mt-4">Game ID: {gameId}</div>
        </div>
      </div>
    );
  }

  if (currentRound === 1) {
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
        <div className="relative z-10 flex flex-col justify-center min-h-screen w-full pt-20">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-6xl md:text-7xl font-bold italic text-white mb-4 tracking-wide" 
                style={{ fontFamily: 'serif' }}>
              Build Wars
            </h1>
            <h2 className="text-3xl md:text-4xl text-white mb-6">Round 1: Pick Your Tool</h2>
            
            {/* Show lobby players instead of start button */}
            {!round1Started ? (
              <div className="mb-8">
                <div className="text-2xl text-white mb-4">
                  Players in Lobby: <span className="font-bold text-blue-400">{lobbyPlayers.count}</span>
                </div>
                {lobbyPlayers.count > 0 && (
                  <div className="text-gray-300 mb-6">
                    <div className="text-sm text-gray-400 mb-2">Players who started Round 1:</div>
                    {lobbyPlayers.players?.slice(0, 5).map((player, index) => (
                      <div key={index} className="text-sm">
                        {player.email.split('@')[0]}
                      </div>
                    )) || lobbyPlayers.emails.slice(0, 5).map((email, index) => (
                      <div key={index} className="text-sm">
                        {email.split('@')[0]}
                      </div>
                    ))}
                    {lobbyPlayers.count > 5 && (
                      <div className="text-sm text-gray-400">
                        +{lobbyPlayers.count - 5} more...
                      </div>
                    )}
                  </div>
                )}
                <button 
                  onClick={startRound1Timer}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-xl font-bold rounded-lg transition-colors"
                >
                  Start Round 1 Timer
                </button>
              </div>
            ) : (
              <>
                {/* Timer */}
                <div className="mb-6">
                  <div className="text-xl text-white mb-2">Time Left: <span className="font-bold text-red-400">{timeLeft}s</span></div>
                </div>
              </>
            )}
          </div>

          {/* Game Interface */}
          {round1Started && (
            <div className="w-full flex flex-col items-center">
              {/* Timer Circle */}
              <div className="text-center mb-8">
                <div className="relative mx-auto mb-6" style={{ width: '120px', height: '120px' }}>
                  <svg className="transform -rotate-90" width="120" height="120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#374151"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#ec4899"
                      strokeWidth="8"
                      fill="transparent"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 50}`}
                      strokeDashoffset={`${2 * Math.PI * 50 * (1 - timeLeft / 30)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{timeLeft}</span>
                  </div>
                </div>
                
                <div className="text-white text-lg mb-2">
                  Choose which AI coding tool (Dualite, v0, Bolt, or Lovable) you think will perform best.
                </div>
                <div className="text-gray-300">You have 30 seconds to decide!</div>
              </div>

              {/* Tool Selection Box */}
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 mx-auto max-w-2xl">
                <h3 className="text-3xl text-white text-center mb-8 italic" style={{ fontFamily: 'serif' }}>
                  Pick Your Tool
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { name: 'Dualite', logo: 'dualite-logo.png', domain: 'dualite.dev', icon: '∞' },
                    { name: 'V0', logo: 'v0-logo.png', domain: 'v0.app', icon: 'v0' },
                    { name: 'Bolt', logo: 'bolt-logo.png', domain: 'bolt.new', icon: '⚡' },
                    { name: 'Lovable', logo: 'lovable-logo.png', domain: 'lovable.dev', icon: '🧡' }
                  ].map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => makeRound1Choice(tool.name)}
                      disabled={timeLeft === 0}
                      className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                        round1Choice === tool.name 
                          ? 'bg-blue-500/30 border-2 border-blue-400 text-white backdrop-blur-sm' 
                          : timeLeft === 0 
                          ? 'bg-white/5 text-gray-400 cursor-not-allowed backdrop-blur-sm border-2 border-white/10'
                          : 'bg-white/10 text-white hover:bg-white/20 border-2 border-transparent hover:border-white/30 backdrop-blur-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <Image
                            src={`/assets/images/${tool.logo}`}
                            alt={`${tool.name} logo`}
                            width={28}
                            height={28}
                            className="object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-lg">{tool.name}</div>
                          <div className="text-sm text-gray-300">{tool.domain}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="text-center">
                  <button
                    onClick={submitRound1Choice}
                    disabled={!round1Choice}
                    className={`px-12 py-3 rounded-xl font-semibold transition-colors text-lg ${
                      round1Choice
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Show existing choice if user has already made one and hasn't started timer */}
          {!round1Started && userGuess?.round1Choice && (
            <div className="text-center mb-6">
              <div className="bg-green-900/80 border border-green-600 rounded-lg p-4 inline-block">
                <div className="text-green-400 font-bold mb-2">✅ Your Round 1 Choice:</div>
                <div className="text-white text-xl font-bold">{userGuess.round1Choice}</div>
              </div>
            </div>
          )}

          {/* Timer ended message */}
          {round1Started && timeLeft === 0 && !round1Choice && (
            <div className="text-center mt-6">
              <div className="text-red-400 font-bold mb-4 text-xl">⏰ Time's up! Please select a tool and submit.</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentRound === 2) {
    const userRound1Choice = round1Choice || userGuess?.round1Choice || 'Dualite';
    
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
        
        {/* Back to Home */}
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition"
          >
            <span className="text-lg">←</span>
            <span>Back to home</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col justify-center min-h-screen w-full">
          {/* Title */}
          <div className="text-center mb-8 w-full flex flex-col items-center">
            <h2 className="text-2xl text-white mb-4">Round 2</h2>
            <div className="text-white text-xl mb-6">
              Which output do you think was created by <span className="font-bold text-blue-400">{userRound1Choice}</span>?
            </div>
          
            {/* Main Game Container */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 max-w-4xl w-full">
            {/* Timer */}
            <div className="text-center mb-8">
              <div className="relative mx-auto mb-6" style={{ width: '120px', height: '120px' }}>
                <svg className="transform -rotate-90" width="120" height="120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#374151"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#ec4899"
                    strokeWidth="8"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - round2TimeLeft / 60)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{round2TimeLeft}</span>
                </div>
              </div>
              <div className="text-white text-lg mb-2">
                Time Left: <span className="font-bold text-red-400">{round2TimeLeft}s</span>
              </div>
              <div className="text-gray-300">You have 60 seconds to analyze and choose!</div>
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <div className="text-gray-300">Analyze the Outputs</div>
            </div>

            {/* Prompt Section */}
            <div className="mb-8">
              <div className="text-white text-sm mb-2">Challenge:</div>
              <div className="bg-white/10 border border-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-gray-300 italic">
                  "{game?.title || 'Loading challenge...'}"
                </div>
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {['A', 'B', 'C', 'D'].map((option) => (
                <button
                  key={option}
                  onClick={() => selectRound2Choice(`Link${option}`)}
                  disabled={round2TimeLeft === 0}
                  className={`relative rounded-xl border-2 transition-all transform hover:scale-105 backdrop-blur-sm ${
                    round2Choice === `Link${option}` || userGuess?.round2Choice === `Link${option}`
                      ? 'border-green-400 bg-green-500/20' 
                      : round2TimeLeft === 0
                      ? 'border-white/10 bg-white/5 cursor-not-allowed opacity-50'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  {/* Placeholder for image - will be translucent for now */}
                  <div className="aspect-video bg-white/10 rounded-t-xl mb-2 flex items-center justify-center backdrop-blur-sm">
                  </div>
                  
                  {/* Option Label */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${
                        round2Choice === `Link${option}` || userGuess?.round2Choice === `Link${option}`
                          ? 'text-green-400' 
                          : 'text-white'
                      }`}>
                        Option {option}
                      </span>
                      {(round2Choice === `Link${option}` || userGuess?.round2Choice === `Link${option}`) && (
                        <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                onClick={submitRound2Choice}
                disabled={(!round2Choice && !userGuess?.round2Choice) || round2TimeLeft === 0}
                className={`px-12 py-3 rounded-xl font-semibold transition-colors text-lg ${
                  (round2Choice || userGuess?.round2Choice) && round2TimeLeft > 0
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Submit
              </button>
            </div>

            {/* Timer ended message */}
            {round2TimeLeft === 0 && !round2Choice && !userGuess?.round2Choice && (
              <div className="text-center mt-4">
                <div className="text-red-400 font-bold text-lg">⏰ Time's up! Please select an option and submit.</div>
              </div>
            )}

            {/* Current Selection Indicator */}
            {(round2Choice || userGuess?.round2Choice) && (
              <div className="text-center mt-4">
                <div className="text-green-400 text-sm">
                  Selected: Option {(round2Choice || userGuess?.round2Choice)?.replace('Link', '')}
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentRound === 3) {
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
        
        {/* Back to Home */}
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition"
          >
            <span className="text-lg">←</span>
            <span>Back to home</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col justify-center items-center min-h-screen w-full p-8">
          {/* Top text */}
          <div className="text-center mb-8">
            <p className="text-gray-300 text-lg">Admins will end the game soon</p>
          </div>

          {/* Main Container */}
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-600 max-w-2xl w-full">
            {/* Waiting Icon and Title */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-8 border-2 border-white rounded-full animate-spin border-t-transparent"></div>
                <h2 className="text-2xl font-bold text-white">Waiting for Results</h2>
              </div>
              <p className="text-green-400 text-lg">You have completed both Rounds</p>
            </div>

            {/* Your Choices Container */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white text-center mb-6">Your Choices</h3>
              
              {/* Choices List */}
              <div className="space-y-4">
                {/* Round 1 */}
                <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Your Choices</div>
                      <div className="text-white font-medium">Round 1</div>
                      <div className="text-sm text-gray-400">Tool</div>
                    </div>
                    <div className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium">
                      {userGuess?.round1Choice || round1Choice}
                    </div>
                  </div>
                </div>

                {/* Round 2 */}
                <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Your Choices</div>
                      <div className="text-white font-medium">Round 2</div>
                      <div className="text-sm text-gray-400">Output</div>
                    </div>
                    <div className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium">
                      {(userGuess?.round2Choice || round2Choice)?.replace('Link', 'Option ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium"
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
              >
                🏠 Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentRound === 4) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-light italic text-white mb-4 tracking-tight">Build Wars</h1>
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4">🎉 Game Complete!</h2>
          <p className="text-xl mb-4 font-light">The game has ended and results are now available.</p>
          <p className="text-gray-400 mb-8 font-light">Click below to see the leaderboard and your score!</p>
          
          <div className="space-y-4">
            <button
              onClick={() => router.push(`/game/${gameId}/results`)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition"
            >
              🏆 View Results & Leaderboard
            </button>
            
            <div>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition mr-4"
              >
                🏠 Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition"
              >
                🔄 Refresh Game
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">Game ID: {gameId}</div>
        </div>
      </div>
    );
  }

  // Default loading or error state
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8">Loading Game...</h1>
        <div className="text-gray-400">Please wait while we load the game details.</div>
      </div>
    </div>
  );
}