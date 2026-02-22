import React from 'react';
import { motion } from 'motion/react';
import { Suit } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface SuitSelectorProps {
  onSelect: (suit: Suit) => void;
  title: string;
}

export const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect, title }) => {
  const suits: { name: Suit; icon: any; color: string }[] = [
    { name: 'hearts', icon: Heart, color: 'text-red-500' },
    { name: 'diamonds', icon: Diamond, color: 'text-red-500' },
    { name: 'clubs', icon: Club, color: 'text-gray-900' },
    { name: 'spades', icon: Spade, color: 'text-gray-900' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="grid grid-cols-2 gap-4">
          {suits.map((suit) => (
            <button
              key={suit.name}
              onClick={() => onSelect(suit.name)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <suit.icon size={48} className={`${suit.color} mb-2 group-hover:scale-110 transition-transform`} fill="currentColor" />
              <span className="capitalize font-semibold text-gray-700">{suit.name}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
