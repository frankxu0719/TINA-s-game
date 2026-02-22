import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Suit } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface PlayingCardProps {
  card: Card;
  isFaceUp?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
  index?: number;
}

const SuitIcon = ({ suit, size = 24 }: { suit: Suit; size?: number }) => {
  switch (suit) {
    case 'hearts': return <Heart size={size} fill="currentColor" className="text-card-red" />;
    case 'diamonds': return <Diamond size={size} fill="currentColor" className="text-card-red" />;
    case 'clubs': return <Club size={size} fill="currentColor" className="text-card-black" />;
    case 'spades': return <Spade size={size} fill="currentColor" className="text-card-black" />;
  }
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isFaceUp = true,
  onClick,
  isPlayable = false,
  className = '',
  index = 0,
}) => {
  if (!card) return null;
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <motion.div
      layoutId={card.id}
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: -20 }}
      whileHover={isPlayable ? { y: -15, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-24 h-36 sm:w-32 sm:h-48 rounded-xl cursor-pointer select-none
        ${isFaceUp ? 'bg-white' : 'bg-indigo-700'}
        ${isPlayable ? 'ring-4 ring-yellow-400 shadow-xl' : 'shadow-md'}
        flex flex-col items-center justify-center border-2 border-gray-200
        ${className}
      `}
      style={{
        zIndex: index,
      }}
    >
      {isFaceUp ? (
        <div className={`w-full h-full p-2 flex flex-col justify-between ${isRed ? 'text-red-600' : 'text-gray-900'}`}>
          <div className="flex flex-col items-start leading-none">
            <span className="text-xl sm:text-2xl font-bold">{card.rank}</span>
            <SuitIcon suit={card.suit} size={16} />
          </div>
          
          <div className="flex justify-center items-center">
            <SuitIcon suit={card.suit} size={48} />
          </div>

          <div className="flex flex-col items-end leading-none rotate-180">
            <span className="text-xl sm:text-2xl font-bold">{card.rank}</span>
            <SuitIcon suit={card.suit} size={16} />
          </div>
        </div>
      ) : (
        <div className="w-full h-full rounded-lg border-4 border-white/20 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white/30 flex items-center justify-center">
            <span className="text-white/50 font-bold text-2xl">T</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
