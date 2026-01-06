
import React from 'react';
import { AnimalType } from '../types';
import { ANIMAL_DATA } from '../constants';

interface Props {
  options: AnimalType[];
  onSelect: (type: AnimalType) => void;
}

const EvolutionSelector: React.FC<Props> = ({ options, onSelect }) => {
  return (
    <div className="absolute inset-0 z-[150] flex flex-col items-center justify-center bg-black/80 backdrop-blur-lg p-8 animate-in fade-in duration-300">
      <h2 className="text-5xl font-black text-white italic mb-4 tracking-tighter">EVOLUTION READY</h2>
      <p className="text-zinc-400 font-bold uppercase tracking-widest mb-12">Select your next form</p>
      
      <div className="flex gap-8 max-w-6xl overflow-x-auto p-4 scrollbar-hide items-center justify-center w-full">
        {options.map((type) => {
          const stats = ANIMAL_DATA[type];
          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="group relative flex flex-col items-center bg-zinc-900 border-4 border-white/10 p-8 rounded-[3rem] transition-all hover:scale-105 hover:border-orange-500 hover:bg-zinc-800 shadow-2xl w-72 flex-shrink-0"
            >
              <div className="text-6xl mb-6 transform group-hover:rotate-12 transition-transform drop-shadow-2xl">
                {stats.movement === 'AIR' ? '🦅' : stats.movement === 'WATER' ? '🦈' : '🦖'}
              </div>
              <h3 className="text-2xl font-black text-white uppercase italic mb-2">{stats.name}</h3>
              <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${
                  stats.movement === 'AIR' ? 'bg-sky-500/20 text-sky-400' :
                  stats.movement === 'WATER' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
              }`}>
                  {stats.movement}
              </div>
              <div className="w-full h-px bg-white/10 mb-4" />
              <p className="text-zinc-400 text-xs font-bold text-center">Ability: <span className="text-white">{stats.abilityName}</span></p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EvolutionSelector;