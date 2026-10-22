import React from 'react';
import { X, Sliders, Type, Palette, Volume2, Flame } from 'lucide-react';
import { TypewriterSettings, TypewriterFont, PaperStyle } from '../types/manuscript';
import { soundEngine } from '../utils/audioEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TypewriterSettings;
  onUpdateSettings: (newSettings: Partial<TypewriterSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-xl bg-[#1c140d] border-2 border-[#543b24] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-[#ded0bc] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#3b2818] flex items-center justify-between bg-[#231810]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c89947] to-[#5a3816] flex items-center justify-center text-[#18110b]">
              <Sliders className="w-4 h-4 text-[#1a110a]" />
            </div>
            <div>
              <h2 className="font-playfair font-bold text-base sm:text-lg text-[#edd8bb]">
                Writing Bureau Settings
              </h2>
              <p className="text-[11px] text-[#9a7e60] font-serif">
                Customize typography, mechanical audio, and atmospheric parchment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#9a7e60] hover:text-[#ecd2ad] hover:bg-[#2e1f14]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          
          {/* Section 1: Classic Typography */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#d4af37] border-b border-[#3e2c1c] pb-1">
              <Type className="w-3.5 h-3.5" />
              <span>Classic Victorian Typography</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'special-elite', name: 'Special Elite', desc: 'Distressed mechanical typewriter' },
                { id: 'courier-prime', name: 'Courier Prime', desc: 'Crisp monospace serif standard' },
                { id: 'im-fell', name: 'IM Fell English', desc: '17th/19th century letterpress' },
                { id: 'libre-baskerville', name: 'Libre Baskerville', desc: 'Refined Victorian novel serif' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => onUpdateSettings({ fontFamily: f.id as TypewriterFont })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    settings.fontFamily === f.id
                      ? 'bg-[#352516] border-[#a57a3e] text-[#f8ecdb] ring-1 ring-[#a57a3e]'
                      : 'bg-[#20160e] border-[#3e2b1b] text-[#9f8569] hover:border-[#60432a]'
                  }`}
                >
                  <div className="font-bold text-xs">{f.name}</div>
                  <div className="text-[10px] text-[#7d654c]">{f.desc}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex justify-between text-xs text-[#baa186] mb-1">
                  <span>Type Size</span>
                  <span className="font-mono">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="23"
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-full accent-[#c49a45] bg-[#312215] h-1.5 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#baa186] mb-1">
                  <span>Line Spacing</span>
                  <span className="font-mono">{settings.lineSpacing.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="2.4"
                  step="0.05"
                  value={settings.lineSpacing}
                  onChange={(e) => onUpdateSettings({ lineSpacing: parseFloat(e.target.value) })}
                  className="w-full accent-[#c49a45] bg-[#312215] h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Parchment & Visual Atmosphere */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#d4af37] border-b border-[#3e2c1c] pb-1">
              <Palette className="w-3.5 h-3.5" />
              <span>Parchment & Paper Aging</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'aged-parchment', name: 'Aged Parchment', color: '#f6eedb' },
                { id: 'victorian-vellum', name: 'Victorian Vellum', color: '#fbf7ee' },
                { id: 'tea-stained', name: 'Tea-Stained', color: '#eee1c5' },
                { id: 'fog-london', name: 'London Fog', color: '#e5e3dd' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => onUpdateSettings({ paperStyle: p.id as PaperStyle })}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    settings.paperStyle === p.id
                      ? 'border-[#a57a3e] bg-[#352516] text-[#f8ecdb] ring-1 ring-[#a57a3e]'
                      : 'border-[#3e2b1b] bg-[#20160e] text-[#9f8569] hover:border-[#60432a]'
                  }`}
                >
                  <div
                    className="w-full h-5 rounded mb-1.5 border border-[#8e6c42]/30 shadow-inner"
                    style={{ backgroundColor: p.color }}
                  />
                  <div className="text-[11px] font-semibold">{p.name}</div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#baa286]">
                <input
                  type="checkbox"
                  checked={settings.candleGlow}
                  onChange={(e) => onUpdateSettings({ candleGlow: e.target.checked })}
                  className="accent-[#c49a45] rounded"
                />
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#f97316]" />
                  Warm Candlelight Glow Effect
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[#baa286]">
                <input
                  type="checkbox"
                  checked={settings.ornateHeaders}
                  onChange={(e) => onUpdateSettings({ ornateHeaders: e.target.checked })}
                  className="accent-[#c49a45] rounded"
                />
                <span>Show Decorative Heading Filigree</span>
              </label>
            </div>
          </div>

          {/* Section 3: Mechanical Key Acoustics */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#d4af37] border-b border-[#3e2c1c] pb-1">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Mechanical Sound & Margin Bell</span>
            </div>

            {/* Machine Mechanism Models */}
            <div>
              <span className="block text-xs text-[#baa186] mb-1.5">Machine Mechanism & Strike Timbre</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'remington1888', name: '1888 Heavy Remington', desc: 'Deep cast-iron strike & platen thud' },
                  { id: 'royal1910', name: '1910 Royal Aristocrat', desc: 'Crisp, high-pitched mechanical snap' },
                  { id: 'underwood1930', name: '1930 Underwood No. 5', desc: 'Classic newsroom rhythmic clatter' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      const model = m.id as 'remington1888' | 'royal1910' | 'underwood1930';
                      soundEngine.setModel(model);
                      soundEngine.unlockAudio();
                      soundEngine.playKeyStroke('X');
                      onUpdateSettings({ soundModel: model });
                    }}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      settings.soundModel === m.id
                        ? 'bg-[#352516] border-[#a57a3e] text-[#f8ecdb] ring-1 ring-[#a57a3e]'
                        : 'bg-[#20160e] border-[#3e2b1b] text-[#9f8569] hover:border-[#60432a]'
                    }`}
                  >
                    <div className="font-bold text-xs">{m.name}</div>
                    <div className="text-[10px] text-[#7d654c] mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs text-[#baa186] mb-1">
                  <span>Keystroke Volume</span>
                  <span className="font-mono">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    soundEngine.setVolume(val);
                    onUpdateSettings({ soundVolume: val });
                  }}
                  className="w-full accent-[#c49a45] bg-[#312215] h-1.5 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#baa186] mb-1">
                  <span>Bell Warning Column</span>
                  <span className="font-mono">{settings.bellMargin} chars</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="78"
                  value={settings.bellMargin}
                  onChange={(e) => onUpdateSettings({ bellMargin: parseInt(e.target.value) })}
                  className="w-full accent-[#c49a45] bg-[#312215] h-1.5 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Test Acoustic Feedback */}
            <div className="p-2 bg-[#17100a] rounded border border-[#3e2c1c] flex items-center justify-between">
              <span className="text-[11px] text-[#9f856a] font-serif">Acoustic Test:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.unlockAudio();
                    soundEngine.playKeyStroke('A');
                  }}
                  className="px-2.5 py-1 bg-[#2b1c11] hover:bg-[#3f2b1a] text-[#edd6b4] rounded text-[10px] font-mono border border-[#523b26]"
                >
                  Key Clack
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.unlockAudio();
                    soundEngine.playSpacebar();
                  }}
                  className="px-2.5 py-1 bg-[#2b1c11] hover:bg-[#3f2b1a] text-[#edd6b4] rounded text-[10px] font-mono border border-[#523b26]"
                >
                  Space Clunk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.unlockAudio();
                    soundEngine.playCarriageReturn();
                  }}
                  className="px-2.5 py-1 bg-[#2b1c11] hover:bg-[#3f2b1a] text-[#edd6b4] rounded text-[10px] font-mono border border-[#523b26]"
                >
                  Carriage Return
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.unlockAudio();
                    soundEngine.playMarginBell();
                  }}
                  className="px-2.5 py-1 bg-[#2b1c11] hover:bg-[#3f2b1a] text-[#eab308] rounded text-[10px] font-mono border border-[#523b26]"
                >
                  Bell 🔔
                </button>
              </div>
            </div>

            {/* Ambient Atmosphere Volume */}
            {settings.ambientSound !== 'none' && (
              <div className="pt-2">
                <div className="flex justify-between text-xs text-[#baa186] mb-1">
                  <span>Ambient {settings.ambientSound} Volume</span>
                  <span className="font-mono">{Math.round(settings.ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.ambientVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    soundEngine.setAmbientVolume(val);
                    onUpdateSettings({ ambientVolume: val });
                  }}
                  className="w-full accent-[#c49a45] bg-[#312215] h-1.5 rounded cursor-pointer"
                />
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#18100a] border-t border-[#352415] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#a57835] text-[#1c120a] font-serif font-bold text-xs rounded hover:bg-[#ba893f]"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
};
