'use client';
import { useEffect, useState } from 'react';
import { use } from 'react';

export default function Step3({ params }) {
  const { roundId } = use(params);
  const [winner, setWinner] = useState(null);
  const [points, setPoints] = useState(null);

  useEffect(() => {
    async function fetchReveal() {
      const res = await fetch(`/api/rounds/${roundId}/reveal`);
      const data = await res.json();
      setWinner(data.winner);
      setPoints(data.points);
    }
    fetchReveal();
  }, [roundId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Step 3: Reveal Winner</h1>
      <div className="mb-4 text-xl">Winner: <span className="font-bold text-green-600">{winner || '-'}</span></div>
      <div className="mb-4 text-lg">Points Awarded: <span className="font-bold">{points ?? '-'}</span></div>
    </div>
  );
}
