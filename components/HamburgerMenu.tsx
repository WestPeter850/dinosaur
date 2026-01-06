
import React, { useState } from 'react';

interface Props {
  onMainMenu: () => void;
  isMusicOn: boolean;
  onToggleMusic: () => void;
  showMusicPlayer: boolean;
  onToggleMusicPlayer: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
}

const HamburgerMenu: React.FC<Props> = ({ 
    onMainMenu, isMusicOn, onToggleMusic, 
    showMusicPlayer, onToggleMusicPlayer,
    volume, onVolumeChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'NONE' | 'RULES' | 'SETTINGS' | 'VISUALS' | 'AUDIO'>('NONE');
  const [openRule, setOpenRule] = useState<number | null>(null);

  const rules = [
    { title: "Survival Basics", content: "Eat food to grow. Ground animals eat red food, Air animals eat yellow insects." },
    { title: "Biomes", content: "Stay in your biome! Water animals dry out on land, Land animals drown in water." },
    { title: "Evolution", content: "Reach XP milestones to evolve. Larger predators can eat smaller dinosaurs." }
  ];

  const renderTabHeader = (title: string) => (
    <button 
      onClick={() => setActiveTab('NONE')} 
      className="text-zinc-500 hover:text-white font-black text-[10px] flex items-center gap-2 mb-4 uppercase tracking-tighter"
    >
      ← {title}
    </button>
  );

  return (
    <div className="absolute top-6 right-6 z-[200]">
      <button 
        onClick={() => { setIsOpen(!isOpen); setActiveTab('NONE'); }}
        className="pointer-events-auto w-14 h-14 bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-1.5 border border-white/10 transition-all shadow-2xl"
      >
        <div className="w-7 h-1 bg-white rounded-full" />
        <div className="w-7 h-1 bg-white rounded-full" />
        <div className="w-7 h-1 bg-white rounded-full" />
      </button>

      {isOpen && (
        <div className="absolute top-20 right-0 w-72 bg-zinc-900/98 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-top-4 duration-200">
          {activeTab === 'NONE' && (
            <div className="space-y-2">
              <button onClick={() => setActiveTab('SETTINGS')} className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-xl text-zinc-300 font-black text-[11px] text-left px-5 flex justify-between items-center transition-colors">
                <span>SETTINGS</span>
                <span className="text-zinc-600">→</span>
              </button>
              <button onClick={() => setActiveTab('VISUALS')} className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-xl text-zinc-300 font-black text-[11px] text-left px-5 flex justify-between items-center transition-colors">
                <span>VISUAL SETTINGS</span>
                <span className="text-zinc-600">→</span>
              </button>
              <button onClick={() => setActiveTab('AUDIO')} className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-xl text-zinc-300 font-black text-[11px] text-left px-5 flex justify-between items-center transition-colors">
                <span>AUDIO SETTINGS</span>
                <span className="text-zinc-600">→</span>
              </button>
              <button onClick={() => setActiveTab('RULES')} className="w-full bg-white/5 hover:bg-white/10 py-4 rounded-xl text-zinc-300 font-black text-[11px] text-left px-5 flex justify-between items-center transition-colors">
                <span>RULES</span>
                <span className="text-zinc-600">→</span>
              </button>
              <div className="h-px bg-white/5 my-3" />
              <button onClick={onMainMenu} className="w-full py-4 bg-red-900/40 hover:bg-red-900/60 text-white font-black text-[11px] rounded-xl transition-all uppercase tracking-widest">
                Main Menu
              </button>
            </div>
          )}

          {activeTab === 'SETTINGS' && (
            <div className="space-y-4">
                {renderTabHeader('GENERAL SETTINGS')}
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-zinc-500 text-[10px] font-black uppercase mb-2">Sensitivity</p>
                    <input 
                      type="range" 
                      min="0" max="100" 
                      value={volume} 
                      onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-600" 
                    />
                  </div>
                  <button className="w-full py-3 bg-white/5 rounded-xl text-[10px] font-bold text-zinc-400">RESET TO DEFAULTS</button>
                </div>
            </div>
          )}

          {activeTab === 'VISUALS' && (
            <div className="space-y-4">
                {renderTabHeader('VISUAL SETTINGS')}
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-orange-600 py-3 rounded-xl text-[10px] font-black text-white">HIGH QUALITY</button>
                  <button className="bg-white/5 py-3 rounded-xl text-[10px] font-black text-zinc-500">LOW QUALITY</button>
                  <button className="bg-white/5 py-3 rounded-xl text-[10px] font-black text-zinc-500">SHOW PARTICLES</button>
                  <button className="bg-white/5 py-3 rounded-xl text-[10px] font-black text-zinc-500">SHOW BUBBLES</button>
                </div>
            </div>
          )}

          {activeTab === 'AUDIO' && (
            <div className="space-y-4">
                {renderTabHeader('AUDIO SETTINGS')}
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                        <span className="text-zinc-400 font-black text-[10px] uppercase">Music</span>
                        <button onClick={onToggleMusic} className={`w-12 h-6 rounded-full relative transition-colors ${isMusicOn ? 'bg-orange-600' : 'bg-zinc-700'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isMusicOn ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                    <button 
                        onClick={onToggleMusicPlayer} 
                        className={`w-full py-3 rounded-xl text-[10px] font-black transition-colors ${showMusicPlayer ? 'bg-orange-600 text-white' : 'bg-white/5 text-zinc-500'}`}
                    >
                        {showMusicPlayer ? 'HIDE MUSIC PLAYER' : 'SHOW MUSIC PLAYER'}
                    </button>
                    <div className="space-y-2 px-1">
                        <div className="flex justify-between text-zinc-600 font-black text-[9px] uppercase">
                          <span>Master Volume</span>
                          <span>{volume}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={volume} 
                          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-600" 
                        />
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'RULES' && (
            <div className="space-y-4">
                {renderTabHeader('RULES')}
                <div className="space-y-1">
                    {rules.map((rule, i) => (
                        <div key={i} className="border-b border-white/5 last:border-none">
                            <button 
                                onClick={() => setOpenRule(openRule === i ? null : i)}
                                className="w-full py-4 flex justify-between items-center text-zinc-300 font-bold text-[11px] text-left hover:text-white transition-colors"
                            >
                                <span className="uppercase tracking-tight">{rule.title}</span>
                                <span className="text-zinc-600 text-xs">
                                  {openRule === i ? '↓' : '→'}
                                </span>
                            </button>
                            {openRule === i && (
                                <div className="pb-5 text-zinc-500 text-[10px] leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200 font-medium">
                                    {rule.content}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;