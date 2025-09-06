'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';

export default function Final({ params }) {
  const { roundId } = use(params);
  const { data: session } = useSession();
  const [previews, setPreviews] = useState([]);
  const [winner, setWinner] = useState(null);
  const [winnerLabel, setWinnerLabel] = useState(null);
  const [userGuessedCorrectly, setUserGuessedCorrectly] = useState(false);
  const [pointsAdded, setPointsAdded] = useState(false);

  useEffect(() => {
    async function fetchFinal() {
      const res = await fetch(`/api/rounds/${roundId}/final`);
      const data = await res.json();
      setPreviews(data.previews || []);
      setWinner(data.winnerTool);
      setWinnerLabel(data.winnerLabel);
      setUserGuessedCorrectly(data.userGuessedCorrectly);
      setPointsAdded(data.pointsAdded);
    }
    fetchFinal();
  }, [roundId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-6xl w-full text-center">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-yellow-400 to-green-400 bg-clip-text text-transparent">
          VibeBet Round #{roundId.slice(-6)}
        </h1>
        <h2 className="text-3xl font-bold mb-6 text-gray-200">🏆 FINAL REVEAL</h2>
        
        {winner && (
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-8 border border-yellow-400/30 mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-4xl font-bold text-yellow-400 mb-2">
              Winner: {winner}
            </h3>
            <p className="text-xl text-gray-200">
              {winner === 'D' && 'Devin (AI Software Engineer)'}
              {winner === 'V' && 'V0 (Vercel AI Builder)'}
              {winner === 'B' && 'Bolt (StackBlitz AI)'}
              {winner === 'L' && 'Lovable (AI App Builder)'}
            </p>
          </div>
        )}

        {/* User Results */}
        {userGuessedCorrectly ? (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-400/30 mb-8">
            <div className="text-4xl mb-2">🎊 CONGRATULATIONS!</div>
            <p className="text-2xl font-bold text-green-300">You predicted correctly!</p>
            <p className="text-xl text-yellow-400 mt-2">+100 Points Awarded! 🏆</p>
          </div>
        ) : (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-6 border border-red-400/30 mb-8">
            <div className="text-4xl mb-2">😔</div>
            <p className="text-xl text-red-300">Better luck next round!</p>
            <p className="text-gray-300">Your prediction didn't match the winning tool this time.</p>
          </div>
        )}

        {/* All Previews with Mapping (Transparency) */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6 text-gray-200">🔍 Full Transparency - All Mappings Revealed</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {previews.map((preview) => (
              <div 
                key={preview.label} 
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border transition duration-300 ${
                  preview.label === winnerLabel 
                    ? 'border-yellow-400 bg-yellow-500/20 shadow-lg shadow-yellow-500/30' 
                    : 'border-white/20'
                }`}
              >
                <div className="mb-4">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {preview.label} → {preview.tool}
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    {preview.tool === 'D' && 'Devin'}
                    {preview.tool === 'V' && 'V0'}
                    {preview.tool === 'B' && 'Bolt'}
                    {preview.tool === 'L' && 'Lovable'}
                  </div>
                </div>
                
                <div className="h-24 bg-gray-800/50 rounded-lg flex items-center justify-center mb-4 border border-gray-600">
                  <div className="text-gray-300 text-center text-sm">
                    {preview.content || `Preview ${preview.label} content`}
                  </div>
                </div>
                
                {preview.label === winnerLabel && (
                  <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    🏆 MOST VOTED
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center">
          <Link 
            href="/" 
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 transition duration-200 shadow-lg"
          >
            🏠 Back to Home
          </Link>
          <Link 
            href="/leaderboard" 
            className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-black rounded-lg font-bold hover:from-yellow-600 hover:to-orange-700 transition duration-200 shadow-lg"
          >
            🏆 View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
