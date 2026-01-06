
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Player, GameState, ChatMessage } from '../types';
import { ANIMAL_DATA, WORLD_SIZE } from '../constants';

interface Props {
  player: Player;
  others: Player[];
  tip?: string;
  isChatVisible: boolean;
  onCloseChat: () => void;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  gameState: GameState;
}

const HUD: React.FC<Props> = ({ 
    player, others, isChatVisible, onCloseChat, chatMessages, onSendMessage, gameState 
}) => {
  const [chatInput, setChatInput] = useState('');
  const [leaderboardOpen, setLeaderboardOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sortedPlayers = [player, ...others].sort((a, b) => b.score - a.score).slice(0, 10);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendMessage(chatInput.trim());
      setChatInput('');
    }
  };

  const pangeaPoints = useMemo(() => {
    const points = [];
    const cx = 50; const cy = 50; const r = 35; const steps = 50;
    for (let i = 0; i < steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        let radius = r + (Math.sin(theta * 3) * 6) + (Math.cos(theta * 7) * 3);
        if (theta > 0.2 && theta < 1.5) radius *= 0.4;
        points.push(`${cx + Math.cos(theta) * radius},${cy + Math.sin(theta) * radius}`);
    }
    return points.join(' ');
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none text-white">
      
      {/* Top Left: Leaderboard */}
      <div className="absolute top-6 left-6 pointer-events-auto">
         {leaderboardOpen ? (
            <div className="bg-black/70 backdrop-blur-md p-5 rounded-2xl border border-white/10 w-64 shadow-2xl transition-all">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10 cursor-pointer" onClick={() => setLeaderboardOpen(false)}>
                    <h3 className="text-orange-500 font-black uppercase text-xs tracking-widest italic">Leaderboard</h3>
                    <span className="text-[10px] text-zinc-500 font-bold">-</span>
                </div>
                <div className="space-y-1.5">
                {sortedPlayers.map((p, idx) => (
                    <div key={p.id} className={`flex justify-between items-center text-xs ${p.id === player.id ? 'text-orange-400 font-black' : 'text-zinc-300 font-medium'}`}>
                    <div className="flex items-center gap-2">
                        <span className="w-4 text-zinc-600 font-bold">{idx + 1}</span>
                        <span className="truncate w-24">{p.name}</span>
                    </div>
                    <span className="opacity-80">{Math.floor(p.score).toLocaleString()}</span>
                    </div>
                ))}
                </div>
            </div>
         ) : (
            <button 
                onClick={() => setLeaderboardOpen(true)}
                className="bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg text-orange-500 font-black text-xs uppercase"
            >
                LEADERBOARD +
            </button>
         )}
      </div>

      {/* Bottom Left: Chat */}
      <div className="absolute bottom-6 left-6 flex flex-col space-y-2 w-80 pointer-events-auto"> 
           {isChatVisible && (
             <div className="bg-black/80 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 shadow-2xl h-64 flex flex-col relative transition-all animate-in slide-in-from-left-4 fade-in">
                <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs scrollbar-hide">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className="break-words leading-snug">
                        <span className="font-black uppercase" style={{ color: msg.sender === player.name ? '#00e676' : (msg.color || '#b388ff') }}>
                            {msg.sender}:
                        </span>
                        <span className="text-zinc-300 ml-1 font-medium text-white/90">{msg.text}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleChatSubmit} className="p-2 bg-white/5 border-t border-white/5">
                   <input 
                     type="text" 
                     value={chatInput} 
                     onChange={(e) => setChatInput(e.target.value)}
                     className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-zinc-600 font-bold"
                     placeholder="Type message..."
                   />
                </form>
             </div>
           )}
           <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
               <p className="text-zinc-600 text-[9px] uppercase font-black tracking-widest shadow-black drop-shadow-md">Press TAB to Chat</p>
           </div>
      </div>

      {/* Bottom Right: Minimap (Square) */}
      <div className="absolute bottom-6 right-6 pointer-events-auto">
        <div className="w-64 h-64 bg-blue-900/60 rounded-3xl border-[6px] border-white/10 relative overflow-hidden shadow-2xl backdrop-blur-md hover:scale-105 transition-transform">
             <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-50">
                <polygon points={pangeaPoints} fill="#4caf50" />
             </svg>
             {/* Render other players on minimap roughly */}
             {others.map(o => (
               <div 
                 key={o.id}
                 className="absolute w-1.5 h-1.5 rounded-full"
                 style={{ 
                   left: `${(o.x / WORLD_SIZE) * 100}%`, 
                   top: `${(o.y / WORLD_SIZE) * 100}%`,
                   backgroundColor: ANIMAL_DATA[o.animalType].color
                 }}
               />
             ))}
             <div 
               className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] transform -translate-x-1/2 -translate-y-1/2 z-10 border-2 border-black"
               style={{ left: `${(player.x / WORLD_SIZE) * 100}%`, top: `${(player.y / WORLD_SIZE) * 100}%` }}
             />
        </div>
        <div className="text-center mt-2">
            <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Pangea Sector 7</span>
        </div>
      </div>

    </div>
  );
};

export default HUD;