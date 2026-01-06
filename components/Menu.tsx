
import React, { useState } from 'react';
import { GameMode, MovementType } from '../types';

interface Props {
  onStart: (name: string, mode: GameMode, biome: MovementType, partyCode?: string) => void;
  challenge: string;
  onNameChange: (name: string) => void;
  name: string;
}

const Menu: React.FC<Props> = ({ onStart, onNameChange, name }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(GameMode.FFA);
  const [selectedBiome, setSelectedBiome] = useState<MovementType>(MovementType.LAND);
  const [partyCode, setPartyCode] = useState('');
  const [error, setError] = useState('');
  const [isJoinParty, setIsJoinParty] = useState(false);

  const handleStart = () => {
    if (name.length < 2 || name.length > 32) {
      setError('Username must be between 2 and 32 characters');
      return;
    }
    
    const badWords = ['admin', 'mod', 'system', 'shit', 'fuck', 'bitch', 'ass', 'cunt', 'dick', 'cock', 'nigger', 'faggot'];
    if (badWords.some(w => name.toLowerCase().includes(w))) {
      setError('Please choose an appropriate username');
      return;
    }
    
    setError('');
    onStart(name, selectedMode, selectedBiome, partyCode);
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-950 via-zinc-950 to-black">
      {/* Square Main Menu */}
      <div className="relative w-full max-w-[600px] bg-zinc-900/90 backdrop-blur-3xl border border-white/5 rounded-[4rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] text-center overflow-hidden flex flex-col justify-center items-center">
        
        <div className="mb-6">
            <h1 className="text-6xl font-black text-white tracking-tighter italic leading-none">
              DINOSAUR<span className="text-orange-500">.IO</span>
            </h1>
            <div className="h-1 w-24 bg-orange-600 mx-auto mt-2 rounded-full" />
        </div>

        <div className="space-y-5 w-full max-w-sm">
            {/* NAME */}
            <div className="relative">
              <input 
                  type="text" 
                  value={name}
                  onChange={(e) => {
                    onNameChange(e.target.value);
                    setError('');
                  }}
                  placeholder="USERNAME"
                  className={`w-full bg-white/5 border-2 ${error ? 'border-red-500' : 'border-white/10'} rounded-2xl py-3 px-6 text-white text-xl font-black placeholder:text-zinc-700 focus:outline-none focus:border-orange-500 transition-all text-center`}
              />
              {error && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-widest">{error}</p>}
            </div>

            {/* BIOME SELECTOR */}
            <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Select Biome</p>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: MovementType.LAND, label: 'LAND', icon: '🦖' },
                        { id: MovementType.WATER, label: 'WATER', icon: '🦈' },
                        { id: MovementType.AIR, label: 'AIR', icon: '🦅' }
                    ].map(biome => (
                         <button
                            key={biome.id}
                            onClick={() => setSelectedBiome(biome.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                                selectedBiome === biome.id 
                                ? 'bg-blue-600/20 border-blue-400 text-white scale-105 shadow-lg shadow-blue-900/20' 
                                : 'bg-white/5 border-white/5 text-zinc-500 hover:bg-white/10'
                            }`}
                         >
                            <span className="text-xl mb-1">{biome.icon}</span>
                            <span className="text-[9px] font-black tracking-widest">{biome.label}</span>
                         </button>
                    ))}
                </div>
            </div>

            {/* GAMEMODE */}
            <div>
                 <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Game Mode</p>
                 <div className="grid grid-cols-3 gap-2">
                    {[
                    { id: GameMode.FFA, label: 'FFA', icon: '⚔️' },
                    { id: GameMode.PARTY, label: 'PARTY', icon: '🤝' },
                    { id: GameMode.BR, label: 'ROYALE', icon: '🔥' }
                    ].map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => {
                            setSelectedMode(mode.id);
                            if(mode.id !== GameMode.PARTY) setIsJoinParty(false);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                            selectedMode === mode.id 
                            ? 'bg-orange-600 border-orange-400 shadow-xl scale-105' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}
                    >
                        <span className="text-xl mb-1">{mode.icon}</span>
                        <span className={`text-[9px] font-black tracking-widest ${selectedMode === mode.id ? 'text-white' : 'text-zinc-500'}`}>{mode.label}</span>
                    </button>
                    ))}
                </div>
            </div>

            {selectedMode === GameMode.PARTY && (
                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                    {!isJoinParty ? (
                        <div className="flex gap-2">
                             <button onClick={() => { setPartyCode(Math.random().toString(36).substring(7).toUpperCase()); setIsJoinParty(true); }} className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-xl text-[10px] font-black text-white uppercase">Create</button>
                             <button onClick={() => setIsJoinParty(true)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 py-2 rounded-xl text-[10px] font-black text-white uppercase">Join</button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={partyCode}
                                onChange={(e) => setPartyCode(e.target.value)}
                                placeholder="ENTER CODE"
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-center text-white text-xs font-bold focus:outline-none"
                            />
                            <button onClick={() => setIsJoinParty(false)} className="px-4 bg-white/10 rounded-xl text-white text-xs">←</button>
                        </div>
                    )}
                </div>
            )}

            <button 
                onClick={handleStart}
                className="group relative w-full h-20 overflow-hidden rounded-[2rem] bg-orange-600 font-black text-3xl text-white shadow-2xl transition-all hover:bg-orange-500 active:scale-95"
            >
                <span className="relative z-10 uppercase italic">PLAY</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Menu;