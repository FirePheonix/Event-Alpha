'use client';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function GamePage(props) {
  const params = React.use(props.params);
  const gameId = params.gameId;
  const { data: session } = useSession();
  const router = useRouter();
  const [game, setGame] = useState(null);
  const [userGuess, setUserGuess] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30); // Start with 30 seconds for Round 1
  const [currentRound, setCurrentRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [round1Started, setRound1Started] = useState(false);
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

  const fetchGame = async () => {
    try {
      const response = await fetch(`/api/game/${gameId}`);
      const data = await response.json();
      setGame(data.game);
      setUserGuess(data.userGuess);
      
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

  const makeRound1Choice = async (tool) => {
    try {
      const response = await fetch(`/api/game/${gameId}/round1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: tool })
      });

      if (response.ok) {
        setRound1Choice(tool); // Store the choice locally
        // Don't automatically move to round 2, let user click "Save and Next Round"
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

  const proceedToRound2 = () => {
    setCurrentRound(2);
  };

  const makeRound2Choice = async (link) => {
    try {
      const response = await fetch(`/api/game/${gameId}/round2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice: link })
      });

      if (response.ok) {
        setRound2Choice(link); // Store the choice locally
        // Redirect back to home dashboard
        router.push('/');
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
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Round 1: Pick Your Tool</h1>
            {!round1Started ? (
              <button 
                onClick={startRound1Timer}
                className="bg-white text-black px-8 py-4 text-xl font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Start Round 1 (30 seconds)
              </button>
            ) : (
              <div className="mb-6">
                <div className="text-2xl font-bold mb-2">Time Left: {timeLeft}s</div>
                <div className="w-full bg-gray-800 rounded-full h-4">
                  <div 
                    className="bg-white h-4 rounded-full transition-all duration-1000" 
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {round1Started && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {['Dualite', 'Lovable', 'Bolt', 'V0'].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => makeRound1Choice(tool)}
                    disabled={timeLeft === 0}
                    className={`p-6 rounded-lg text-xl font-bold transition transform hover:scale-105 ${
                      round1Choice === tool 
                        ? 'bg-green-600 text-white border-2 border-green-400' // Selected choice
                        : timeLeft === 0 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-200 shadow-lg'
                    }`}
                  >
                    {tool}
                    {round1Choice === tool && ' ✓'}
                  </button>
                ))}
              </div>
              
              {/* Show current choice */}
              {round1Choice && (
                <div className="text-center mt-6">
                  <div className="text-green-400 font-bold mb-4">
                    ✅ You selected: {round1Choice}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Show existing choice if user has already made one */}
          {!round1Started && userGuess?.round1Choice && (
            <div className="text-center mb-6">
              <div className="bg-green-900 border border-green-600 rounded-lg p-4 inline-block">
                <div className="text-green-400 font-bold mb-2">✅ Your Round 1 Choice:</div>
                <div className="text-white text-xl font-bold">{userGuess.round1Choice}</div>
              </div>
            </div>
          )}

          {(timeLeft === 0 || round1Choice) && (
            <div className="text-center mt-6">
              {timeLeft === 0 && !round1Choice && (
                <div className="text-red-400 font-bold mb-4">⏰ Time's up!</div>
              )}
              <button 
                onClick={proceedToRound2}
                disabled={!round1Choice && !userGuess?.round1Choice}
                className={`px-8 py-4 text-xl font-bold rounded-lg transition-colors ${
                  round1Choice || userGuess?.round1Choice
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                Save and Next Round
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentRound === 2) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Round 2: Pick the Link</h1>
            <p className="text-xl text-gray-300">Which link will receive the most votes?</p>
            
            {/* Show Round 1 choice summary */}
            {(round1Choice || userGuess?.round1Choice) && (
              <div className="mt-4 bg-gray-900 border border-gray-700 rounded-lg p-4 inline-block">
                <div className="text-gray-400 text-sm">Your Round 1 Choice:</div>
                <div className="text-green-400 font-bold">{round1Choice || userGuess?.round1Choice}</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {game?.linkMappings?.map((mapping) => (
              <button
                key={mapping.linkId}
                onClick={() => makeRound2Choice(mapping.linkId)}
                className={`p-6 rounded-lg transition-all text-left border-2 ${
                  round2Choice === mapping.linkId || userGuess?.round2Choice === mapping.linkId
                    ? 'bg-green-600 border-green-400 text-white' // Selected choice
                    : 'bg-gray-900 border-gray-700 hover:border-white hover:bg-gray-800'
                }`}
              >
                <div className="text-xl font-bold mb-2">
                  {mapping.linkId}
                  {(round2Choice === mapping.linkId || userGuess?.round2Choice === mapping.linkId) && ' ✓'}
                </div>
                {mapping.description && (
                  <div className="text-gray-400 text-sm">{mapping.description}</div>
                )}
              </button>
            ))}
          </div>
          
          {/* Show current choice */}
          {(round2Choice || userGuess?.round2Choice) && (
            <div className="text-center mt-6">
              <div className="text-green-400 font-bold mb-4">
                ✅ You selected: {round2Choice || userGuess?.round2Choice}
              </div>
              <div className="text-gray-400">
                You will be redirected to the dashboard after making your choice.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentRound === 3) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">Waiting for Results</h1>
          <p className="text-xl mb-4">You have completed both rounds!</p>
          
          {/* Show user's choices summary */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6 inline-block">
            <h3 className="text-lg font-bold mb-4 text-green-400">Your Choices:</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-400">Round 1 (Tool): </span>
                <span className="text-white font-bold">{userGuess?.round1Choice || round1Choice}</span>
              </div>
              <div>
                <span className="text-gray-400">Round 2 (Link): </span>
                <span className="text-white font-bold">{userGuess?.round2Choice || round2Choice}</span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-400 mb-6">Waiting for all players to finish and admin to end the game...</p>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition ml-4"
            >
              🏠 Back to Dashboard
            </button>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">Game ID: {gameId}</div>
        </div>
      </div>
    );
  }

  if (currentRound === 4) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-8">🎉 Game Complete!</h1>
          <p className="text-xl mb-4">The game has ended and results are now available.</p>
          <p className="text-gray-400 mb-8">Click below to see the leaderboard and your score!</p>
          
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
