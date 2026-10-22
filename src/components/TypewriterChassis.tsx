import React from 'react';
import { TypewriterSettings } from '../types/manuscript';
import { soundEngine } from '../utils/audioEngine';

interface TypewriterChassisProps {
  settings: TypewriterSettings;
  cursorColumn: number;
  isLeverPulling: boolean;
  onCarriageReturn: () => void;
  children: React.ReactNode;
}

export const TypewriterChassis: React.FC<TypewriterChassisProps> = ({
  settings,
  cursorColumn,
  isLeverPulling,
  onCarriageReturn,
  children,
}) => {
  if (settings.viewMode === 'desk') {
    return (
      <div className="relative w-full max-w-4xl mx-auto my-6 px-2 sm:px-6">
        {children}
      </div>
    );
  }

  // Calculate carriage indicator needle position along the ruler (0 to 80 chars)
  const clampedCol = Math.min(80, Math.max(0, cursorColumn));
  const needlePercent = (clampedCol / 80) * 100;

  return (
    <div className="relative w-full max-w-5xl mx-auto my-4 sm:my-8 px-2 sm:px-4">
      {/* Outer Typewriter Cast-Iron & Enameled Metal Body */}
      <div className="relative rounded-t-2xl rounded-b-xl bg-gradient-to-b from-[#1b1511] via-[#241c16] to-[#120d09] border-4 border-[#3a281a] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-3 sm:p-6 text-[#d6c7b0] transition-all">
        
        {/* Vintage Brand Gold Foil Decal */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3e2c1e]/60 mb-4 px-2">
          <div className="flex items-center gap-2">
            <span className="text-[#a47a3e] font-serif text-xs tracking-widest uppercase">
              ✦ REMINGTON STANDARD TYPEWRITER ✦
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#8e7355] font-serif tracking-widest uppercase hidden sm:inline">
              ILION, NEW YORK • PATENTED 1888
            </span>
            <div className="w-2.5 h-2.5 rounded-full bg-[#8b6537] border border-[#d4af37] shadow-inner" />
          </div>
        </div>

        {/* The Platen Assembly & Margin Ruler */}
        <div className="relative bg-[#0d0906] border-2 border-[#433020] rounded-lg p-2.5 sm:p-4 mb-4 shadow-inner">
          
          {/* Mechanical Carriage Return Lever (Top Left) */}
          <div className="absolute -top-7 -left-3 sm:-left-6 z-30 flex items-center">
            <button
              onClick={onCarriageReturn}
              className={`group flex items-center focus:outline-none transition-transform origin-bottom-right ${
                isLeverPulling ? 'lever-action' : 'hover:-translate-y-0.5'
              }`}
              title="Pull Carriage Return Lever (or press Enter)"
            >
              {/* Chrome/Brass Curved Lever Arm */}
              <div className="relative flex flex-col items-center">
                {/* Brass Ball Grip */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#7c5625] via-[#d4af37] to-[#f5d77f] border border-[#4a3316] shadow-md flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform">
                  <div className="w-2 h-2 rounded-full bg-[#4a3316]/40" />
                </div>
                {/* Curved Nickel Bar */}
                <div className="w-2 h-10 bg-gradient-to-r from-[#999] via-[#e5e5e5] to-[#777] rounded-sm shadow-md" />
                <div className="w-5 h-2.5 bg-[#422e1c] rounded-b border-t border-[#666]" />
              </div>
              <span className="ml-2 text-[10px] text-[#caa765] font-serif uppercase tracking-wider hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity bg-[#1b120a] px-1.5 py-0.5 rounded border border-[#523b26]">
                Return
              </span>
            </button>
          </div>

          {/* Platen Roller Barrel (Horizontal cylinder) */}
          <div className="relative h-10 sm:h-12 w-full bg-gradient-to-b from-[#111] via-[#2d2824] to-[#0a0705] rounded-md border border-[#3e3228] shadow-inner flex items-center justify-between px-3 overflow-hidden">
            
            {/* Rubber platen horizontal lines */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,#fff_21px)]" />

            {/* Left Platen Turning Knob */}
            <button
              onClick={() => soundEngine.playPaperKnob()}
              className="relative z-10 w-6 h-7 rounded-sm bg-gradient-to-r from-[#7a5726] via-[#d4af37] to-[#61421b] border border-[#3f2a11] shadow-md hover:brightness-110 active:rotate-12 transition-all flex items-center justify-center cursor-pointer"
              title="Turn Left Platen Knob (ratchet sound)"
            >
              <div className="w-3/4 h-0.5 bg-[#2c1d0c]" />
            </button>

            {/* Center: Nickel Paper Bail Bar with Scale */}
            <div className="relative z-10 flex-1 mx-3 sm:mx-6 flex flex-col items-center">
              {/* Thin chrome bail rod */}
              <div className="w-full h-1 bg-gradient-to-r from-[#888] via-[#e0e0e0] to-[#888] rounded-full shadow-sm mb-1" />
              {/* Paper bail rubber rollers */}
              <div className="w-full flex justify-around px-8 pointer-events-none">
                <div className="w-3 h-2 bg-[#1a1410] rounded-sm border border-[#555]" />
                <div className="w-3 h-2 bg-[#1a1410] rounded-sm border border-[#555]" />
              </div>
            </div>

            {/* Right Platen Turning Knob */}
            <button
              onClick={() => soundEngine.playPaperKnob()}
              className="relative z-10 w-6 h-7 rounded-sm bg-gradient-to-r from-[#61421b] via-[#d4af37] to-[#7a5726] border border-[#3f2a11] shadow-md hover:brightness-110 active:-rotate-12 transition-all flex items-center justify-center cursor-pointer"
              title="Turn Right Platen Knob (ratchet sound)"
            >
              <div className="w-3/4 h-0.5 bg-[#2c1d0c]" />
            </button>
          </div>

          {/* Engraved Nickel Margin Ruler with Live Moving Indicator Needle */}
          <div className="mt-2 relative w-full h-6 bg-[#1f1a14] border border-[#4a3522] rounded px-3 flex items-center">
            {/* 0 to 80 characters marks */}
            <div className="w-full flex justify-between text-[9px] font-mono text-[#8a7258] select-none pointer-events-none px-1">
              <span>0</span>
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
              <span>50</span>
              <span>60</span>
              <span className={cursorColumn >= settings.bellMargin ? 'text-[#ef4444] font-bold' : ''}>
                {settings.bellMargin}🔔
              </span>
              <span>80</span>
            </div>

            {/* Red Carriage Needle Tracking Cursor Column */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#ef4444] shadow-[0_0_6px_#ef4444] transition-all duration-75 pointer-events-none"
              style={{ left: `calc(${needlePercent}% * 0.94 + 3%)` }}
            >
              <div className="w-2 h-2 bg-[#ef4444] -ml-[3px] rotate-45" />
            </div>
          </div>

        </div>

        {/* Paper Feed Slot & The Manuscript Document Sheet */}
        <div className="relative">
          {children}
        </div>

        {/* Typebar Basket Arc & Ribbon Spool Casings (Bottom Typewriter Mechanism) */}
        <div className="mt-6 pt-4 border-t-2 border-[#382618] flex items-center justify-between px-2 sm:px-6">
          
          {/* Left Ribbon Spool Cover */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#2a1e15] to-[#120d09] border-2 border-[#64492d] shadow-inner flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#18110b] border border-[#946e3e] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] text-[#8e7355] font-serif uppercase tracking-wider block">Supply Spool</span>
              <span className="text-[9px] text-[#5e4934]">Silk 1/2 Inch</span>
            </div>
          </div>

          {/* Center Typebars Decorative Fan */}
          <div className="flex flex-col items-center">
            <div className="w-28 sm:w-48 h-3.5 flex justify-center items-end gap-1 overflow-hidden opacity-40">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-gradient-to-t from-[#c49a45] to-[#444] rounded-t-full transition-transform"
                  style={{
                    height: `${12 + Math.sin((i / 14) * Math.PI) * 16}px`,
                  }}
                />
              ))}
            </div>
            <div className="text-[10px] text-[#8e7355] font-serif uppercase tracking-widest mt-0.5">
              Typebar Segment
            </div>
          </div>

          {/* Right Ribbon Spool Cover */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <span className="text-[10px] text-[#8e7355] font-serif uppercase tracking-wider block">Take-Up Spool</span>
              <span className="text-[9px] text-[#5e4934]">Clockwise</span>
            </div>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#2a1e15] to-[#120d09] border-2 border-[#64492d] shadow-inner flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#18110b] border border-[#946e3e] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
