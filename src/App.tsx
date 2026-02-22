import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, GameState, Suit, GameStatus } from './types';
import { createDeck, canPlayCard, shuffle } from './utils/gameLogic';
import { PlayingCard } from './components/PlayingCard';
import { SuitSelector } from './components/SuitSelector';
import { Trophy, RefreshCw, Info, ChevronRight, Heart, Languages } from 'lucide-react';
import { Language, translations } from './i18n';

const INITIAL_HAND_SIZE = 8;

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const t = translations[lang];

  const [gameState, setGameState] = useState<GameState>({
    deck: [],
    discardPile: [],
    playerHand: [],
    aiHand: [],
    currentTurn: 'player',
    status: 'start_screen',
    activeSuit: null,
    winner: null,
  });

  const [message, setMessage] = useState<string>(translations['zh'].welcome);

  // Initialize Game
  const initGame = useCallback(() => {
    const fullDeck = createDeck();
    const playerHand = fullDeck.slice(0, INITIAL_HAND_SIZE);
    const aiHand = fullDeck.slice(INITIAL_HAND_SIZE, INITIAL_HAND_SIZE * 2);
    const discardPile = [fullDeck[INITIAL_HAND_SIZE * 2]];
    const deck = fullDeck.slice(INITIAL_HAND_SIZE * 2 + 1);

    setGameState({
      deck,
      discardPile,
      playerHand,
      aiHand,
      currentTurn: 'player',
      status: 'playing',
      activeSuit: null,
      winner: null,
    });
    setMessage(t.yourTurnMsg);
  }, [t.yourTurnMsg]);

  // Removed auto-init useEffect to allow start screen to handle it


  // AI Logic
  useEffect(() => {
    if (gameState.status === 'playing' && gameState.currentTurn === 'ai' && !gameState.winner) {
      const timer = setTimeout(() => {
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];
        const playableCards = gameState.aiHand.filter(card => 
          canPlayCard(card, topCard, gameState.activeSuit)
        );

        // Nerf AI: 25% chance to "miss" a playable card and draw instead
        const shouldMiss = Math.random() < 0.25;

        if (playableCards.length > 0 && !shouldMiss) {
          // Play a random playable card
          const card = playableCards[Math.floor(Math.random() * playableCards.length)];
          playCard(card, 'ai');
        } else {
          drawCard('ai');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurn, gameState.status, gameState.aiHand, gameState.discardPile, gameState.activeSuit, gameState.winner]);

  const playCard = (card: Card, player: 'player' | 'ai') => {
    const isEight = card.rank === '8';
    
    setGameState(prev => {
      const handKey = player === 'player' ? 'playerHand' : 'aiHand';
      const newHand = prev[handKey].filter(c => c.id !== card.id);
      const newDiscard = [...prev.discardPile, card];
      
      // Check for winner
      if (newHand.length === 0) {
        return {
          ...prev,
          [handKey]: newHand,
          discardPile: newDiscard,
          status: 'game_over',
          winner: player,
        };
      }

      if (isEight && player === 'player') {
        return {
          ...prev,
          [handKey]: newHand,
          discardPile: newDiscard,
          status: 'picking_suit',
        };
      }

      // AI automatically picks a suit if it plays an 8
      let newActiveSuit: Suit | null = null;
      if (isEight && player === 'ai') {
        const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
        newActiveSuit = suits[Math.floor(Math.random() * suits.length)];
      }

      return {
        ...prev,
        [handKey]: newHand,
        discardPile: newDiscard,
        activeSuit: newActiveSuit,
        currentTurn: player === 'player' ? 'ai' : 'player',
      };
    });

    if (isEight && player === 'ai') {
      setMessage(t.aiPlayedEight);
    } else if (player === 'ai') {
      setMessage(t.aiPlayedCard);
    }
  };

  const drawCard = (player: 'player' | 'ai') => {
    setGameState(prev => {
      let currentDeck = [...prev.deck];
      let currentDiscard = [...prev.discardPile];
      const handKey = player === 'player' ? 'playerHand' : 'aiHand';

      // If deck is empty, try to reshuffle the discard pile
      if (currentDeck.length === 0) {
        if (currentDiscard.length <= 1) {
          setMessage(t.noMoreCards);
          // Truly no cards left to draw
          return {
            ...prev,
            currentTurn: player === 'player' ? 'ai' : 'player',
          };
        }
        
        // Keep the top card, shuffle the rest into a new deck
        const topCard = currentDiscard[currentDiscard.length - 1];
        const cardsToShuffle = currentDiscard.slice(0, -1);
        currentDeck = shuffle(cardsToShuffle);
        currentDiscard = [topCard];
      }

      // Draw the card
      const [drawnCard, ...remainingDeck] = currentDeck;
      
      // Safety check: if for some reason we still don't have a card, just skip
      if (!drawnCard) {
        return {
          ...prev,
          currentTurn: player === 'player' ? 'ai' : 'player',
        };
      }

      return {
        ...prev,
        deck: remainingDeck,
        discardPile: currentDiscard,
        [handKey]: [...prev[handKey], drawnCard],
        currentTurn: player === 'player' ? 'ai' : 'player',
      };
    });

    setMessage(player === 'player' ? t.youDrew : t.aiDrew);
  };

  const handleSuitSelect = (suit: Suit) => {
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      activeSuit: suit,
      currentTurn: 'ai',
    }));
    setMessage(t.suitChanged.replace('{suit}', suit));
  };

  const topCard = gameState.discardPile[gameState.discardPile.length - 1];

  return (
    <div className="h-screen w-screen felt-texture overflow-hidden flex flex-col relative">
      {/* Header / Info */}
      <header className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="font-bold text-xl">T</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10 text-xs font-bold hover:bg-white/20 transition-colors"
          >
            <Languages size={14} />
            {lang === 'en' ? '中文' : 'EN'}
          </button>
          <div className="px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-sm font-medium">
            {t.deck}: {gameState.deck.length}
          </div>
          <button 
            onClick={initGame}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-4">
        
        {/* AI Hand */}
        <div className="absolute top-8 flex justify-center w-full">
          <div className="flex -space-x-12 sm:-space-x-16">
            {gameState.aiHand.map((card, i) => (
              <PlayingCard 
                key={card.id} 
                card={card} 
                isFaceUp={false} 
                index={i}
                className="scale-75 sm:scale-90"
              />
            ))}
          </div>
        </div>

        {/* Center Table */}
        <div className="flex items-center gap-8 sm:gap-16 z-0">
          {/* Draw Pile */}
          <div 
            className="relative group cursor-pointer"
            onClick={() => gameState.currentTurn === 'player' && gameState.status === 'playing' && drawCard('player')}
          >
            <div className="w-24 h-36 sm:w-32 sm:h-48 bg-indigo-800 rounded-xl border-2 border-white/20 shadow-2xl flex items-center justify-center transform group-hover:-translate-y-2 transition-transform">
               <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center">
                <span className="text-white/50 font-bold text-xl">?</span>
              </div>
            </div>
            {gameState.deck.length > 1 && (
              <div className="absolute -top-1 -left-1 w-full h-full bg-indigo-900 rounded-xl -z-10 border border-white/10"></div>
            )}
            {gameState.deck.length > 2 && (
              <div className="absolute -top-2 -left-2 w-full h-full bg-indigo-950 rounded-xl -z-20 border border-white/10"></div>
            )}
          </div>

          {/* Discard Pile */}
          <div className="relative">
            <AnimatePresence mode="popLayout">
              {topCard && (
                <PlayingCard 
                  key={topCard.id} 
                  card={topCard} 
                  className="shadow-2xl"
                />
              )}
            </AnimatePresence>
            {gameState.activeSuit && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                SUIT: {gameState.activeSuit.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Player Hand */}
        <div className="absolute bottom-8 flex justify-center w-full">
          <div className="flex -space-x-12 sm:-space-x-16 hover:space-x-2 transition-all duration-300 px-12">
            {gameState.playerHand.map((card, i) => (
              <PlayingCard 
                key={card.id} 
                card={card} 
                index={i}
                isPlayable={gameState.currentTurn === 'player' && gameState.status === 'playing' && canPlayCard(card, topCard, gameState.activeSuit)}
                onClick={() => playCard(card, 'player')}
              />
            ))}
          </div>
        </div>

        {/* Status Message */}
        <div className="absolute bottom-52 sm:bottom-64 left-1/2 -translate-x-1/2 w-full max-w-xs text-center">
          <motion.p 
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold text-white/80 bg-black/30 backdrop-blur-sm py-2 px-6 rounded-full inline-block"
          >
            {message}
          </motion.p>
        </div>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {gameState.status === 'start_screen' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6"
          >
            <div className="text-center max-w-2xl w-full">
              <motion.div
                initial={{ scale: 0.5, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 12 }}
                className="mb-12 relative inline-block"
              >
                <div className="w-32 h-32 sm:w-48 sm:h-48 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)] rotate-12 mx-auto">
                  <span className="font-black text-6xl sm:text-8xl text-white">8</span>
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg -rotate-12 border-4 border-white">
                   <Heart size={32} fill="white" className="text-white" />
                </div>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl sm:text-7xl font-black tracking-tighter mb-4 text-white"
              >
                {t.title.toUpperCase()}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/60 mb-12 font-medium"
              >
                {t.tagline}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <button 
                  onClick={initGame}
                  className="group relative px-12 py-5 bg-white text-indigo-900 rounded-2xl font-black text-2xl hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
                >
                  {t.startGame}
                  <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={28} />
                </button>
                
                <div className="flex gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left">
                    <p className="text-xs font-bold text-white/40 uppercase mb-1">{t.rulesTitle}</p>
                    <p className="text-sm text-white/80">{t.rulesDesc}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {gameState.status === 'picking_suit' && (
          <SuitSelector onSelect={handleSuitSelect} title={t.pickSuit} />
        )}

        {gameState.status === 'game_over' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
          >
            <div className="bg-white text-gray-900 p-10 rounded-3xl shadow-2xl text-center max-w-sm w-full">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${gameState.winner === 'player' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'}`}>
                <Trophy size={48} />
              </div>
              <h2 className="text-4xl font-extrabold mb-2">
                {gameState.winner === 'player' ? t.youWin : t.aiWins}
              </h2>
              <p className="text-gray-500 mb-8">
                {gameState.winner === 'player' ? t.winDesc : t.loseDesc}
              </p>
              <button 
                onClick={initGame}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={24} />
                {t.playAgain}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Turn Indicator */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${gameState.currentTurn === 'player' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'}`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${gameState.currentTurn === 'player' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="text-xs font-bold uppercase tracking-widest">
            {gameState.currentTurn === 'player' ? t.yourTurn : t.aiTurn}
          </span>
        </div>
      </div>
    </div>
  );
}
