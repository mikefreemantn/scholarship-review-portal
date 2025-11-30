import React, { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VotingSliderProps {
  onVote: (score: number) => void;
  disabled?: boolean;
  initialScore?: number;
  isUpdate?: boolean;
}

export const VotingSlider: React.FC<VotingSliderProps> = ({ 
  onVote, 
  disabled = false, 
  initialScore,
  isUpdate = false 
}) => {
  const [score, setScore] = useState<number>(initialScore || 5);
  const [showConfirm, setShowConfirm] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);

  // Update score when initialScore changes (e.g., navigating between applicants)
  useEffect(() => {
    if (initialScore !== undefined) {
      setScore(initialScore);
    }
  }, [initialScore]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScore = parseInt(e.target.value);
    setScore(newScore);
    
    // Trigger confetti when hitting 10!
    if (newScore === 10) {
      const rect = e.target.getBoundingClientRect();
      const x = (rect.left + rect.width * 0.9) / window.innerWidth; // Position at the slider knob
      const y = rect.top / window.innerHeight;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        colors: ['#2d4a3e', '#d4c5a0', '#5a8062', '#c9b88f'],
        ticks: 200,
      });
    }
  };

  const handleVoteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onVote(score);
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-xl font-semibold mb-6 text-primary-600">
        {isUpdate ? 'Update Your Vote' : 'Cast Your Vote'}
      </h3>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-base font-medium text-gray-700">Score</span>
          <span className="text-5xl font-bold text-primary-600">{score}</span>
        </div>
        
        <div className="relative py-4">
          <input
            type="range"
            min="0"
            max="10"
            value={score}
            onChange={handleSliderChange}
            disabled={disabled}
            className="w-full h-6 rounded-lg appearance-none cursor-pointer voting-slider"
            style={{
              background: `linear-gradient(to right, #2d4a3e ${score * 10}%, #e5e7eb ${score * 10}%)`,
              backgroundImage: score > 0 ? `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px), linear-gradient(to right, #2d4a3e ${score * 10}%, #e5e7eb ${score * 10}%)` : undefined
            }}
          />
        </div>
        
        <div className="flex justify-between text-sm font-medium text-gray-600 mt-2">
          <span>0</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>

      {!showConfirm ? (
        <button
          onClick={handleVoteClick}
          disabled={disabled}
          className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md"
          style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.05) 20px, rgba(255,255,255,0.05) 40px)'}}
        >
          {isUpdate ? 'Update Vote' : 'Submit Vote'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg p-5" style={{backgroundColor: 'rgb(249, 244, 235)', border: '2px solid rgb(211, 190, 146)'}}>
            <p className="text-base font-semibold" style={{color: '#2d4a3e'}}>
              {isUpdate ? 'Update' : 'Confirm'} your vote of <span className="font-bold text-xl">{score}/10</span>?
            </p>
            <p className="text-sm mt-2" style={{color: '#5a8062'}}>
              {isUpdate ? 'This will replace your previous vote.' : 'This action cannot be undone.'}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-5 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-primary-600 text-white py-3 px-5 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Confirm Vote
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
