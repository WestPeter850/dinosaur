
import React from 'react';

interface Props {
  onClose: () => void;
  onMainMenu: () => void;
}

const SettingsOverlay: React.FC<Props> = ({ onClose, onMainMenu }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-10">
            <h2 className="text-4xl font-black text-white italic tracking-tighter">SETTINGS</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        <div className="space-y-8">
            <div className="space-y-4">
                <label className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">Volume</label>
                <input type="range" className="w-full accent-orange-600" />
            </div>

            <div className="space-y-4">
                <label className="text-zinc-500 text-[10px] font-black tracking-widest uppercase">Visual Quality</label>
                <div className="grid grid-cols-3 gap-2">
                    <button className="bg-white/5 py-3 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white/10">Low</button>
                    <button className="bg-orange-600 py-3 rounded-xl text-xs font-bold text-white">High</button>
                    <button className="bg-white/5 py-3 rounded-xl text-xs font-bold text-zinc-400 hover:bg-white/10">Ultra</button>
                </div>
            </div>

            <div className="space-y-4 pt-8 border-t border-white/5">
                <button 
                  onClick={onMainMenu}
                  className="w-full py-5 bg-white/5 hover:bg-red-900/20 hover:text-red-400 border border-white/5 rounded-2xl text-lg font-black transition-all text-zinc-500"
                >
                    EXIT TO MAIN MENU
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-lg font-black transition-all shadow-xl"
                >
                    RESUME SURVIVAL
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;
