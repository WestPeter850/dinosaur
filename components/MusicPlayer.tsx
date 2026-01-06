
import React, { useState, useEffect } from 'react';

interface Props {
  currentTrack: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const MusicPlayer: React.FC<Props> = ({ 
  currentTrack, isPlaying, onTogglePlay, onNext, onPrev, 
  volume, onVolumeChange, currentTime, duration, onSeek 
}) => {
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black border-t border-white/5 flex items-center justify-between px-4 z-[250] pointer-events-auto select-none">
      
      {/* Left: Info */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-900 rounded shadow-lg flex items-center justify-center text-2xl">
          🦖
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-white text-sm font-bold truncate">{currentTrack || 'No Track Selected'}</span>
          <span className="text-zinc-500 text-xs font-medium">Dinosaur.io • Pangea Records</span>
        </div>
        <button className="ml-4 text-zinc-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
        </button>
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center gap-2 w-1/3">
        <div className="flex items-center gap-6">
          <button className="text-zinc-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 11V7l-5 5 5 5v-4h13v-2H7z"></path></svg></button>
          <button onClick={onPrev} className="text-zinc-400 hover:text-white transition-colors">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6L18 6v12z"></path></svg>
          </button>
          <button 
            onClick={onTogglePlay}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
            ) : (
              <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
            )}
          </button>
          <button onClick={onNext} className="text-zinc-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"></path></svg>
          </button>
          <button className="text-zinc-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"></path></svg></button>
        </div>
        
        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-[10px] text-zinc-500 font-bold w-8 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 h-1 bg-zinc-800 rounded-full relative group cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            onSeek(pos * duration);
          }}>
            <div 
              className="absolute top-0 left-0 h-full bg-white group-hover:bg-green-500 rounded-full"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg"
              style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-500 font-bold w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume */}
      <div className="flex items-center justify-end gap-3 w-1/3 pr-4">
        <button className="text-zinc-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14,10H2V12H14V10M14,6H2V8H14V6M2,16H10V14H2V16M21.5,11.5L23,13L16,20L11.5,15.5L13,14L16,17L21.5,11.5Z"></path></svg></button>
        <button className="text-zinc-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"></path></svg></button>
        <div className="flex items-center gap-2 w-32">
          <svg className="w-4 h-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24"><path d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16.02C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"></path></svg>
          <div className="flex-1 h-1 bg-zinc-800 rounded-full relative group cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            onVolumeChange(Math.max(0, Math.min(100, Math.round(pos * 100))));
          }}>
            <div 
              className="absolute top-0 left-0 h-full bg-white group-hover:bg-green-500 rounded-full"
              style={{ width: `${volume}%` }}
            />
          </div>
        </div>
        <button className="text-zinc-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7,14H5V5H7V14M19,14H17V5H19V14M13,5H11V14H13V5M8.5,16L12,22L15.5,16H8.5Z"></path></svg></button>
      </div>

    </div>
  );
};

export default MusicPlayer;
