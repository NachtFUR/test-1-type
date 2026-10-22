import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Download, 
  Settings as SettingsIcon, 
  Feather, 
  Flame, 
  CloudRain, 
  Clock, 
  CheckCircle2, 
  Sliders, 
  Monitor, 
  FileText,
  ChevronDown
} from 'lucide-react';
import { Manuscript, TypewriterSettings } from '../types/manuscript';
import { soundEngine } from '../utils/audioEngine';

interface NavbarProps {
  currentManuscript: Manuscript;
  settings: TypewriterSettings;
  onUpdateSettings: (newSettings: Partial<TypewriterSettings>) => void;
  onOpenManuscripts: () => void;
  onOpenLexicon: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onRenameTitle: (title: string) => void;
  isSaving: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentManuscript,
  settings,
  onUpdateSettings,
  onOpenManuscripts,
  onOpenLexicon,
  onOpenSettings,
  onOpenExport,
  onRenameTitle,
  isSaving,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentManuscript.title);
  const [soundMenuOpen, setSoundMenuOpen] = useState(false);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      onRenameTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const toggleSoundMute = () => {
    const nextMute = !settings.soundMuted;
    soundEngine.setMuted(nextMute);
    onUpdateSettings({ soundMuted: nextMute });
  };

  const cycleAmbient = () => {
    const sequence: ('none' | 'fireplace' | 'rain' | 'clock')[] = ['none', 'fireplace', 'rain', 'clock'];
    const nextIdx = (sequence.indexOf(settings.ambientSound) + 1) % sequence.length;
    const nextAmbient = sequence[nextIdx];
    soundEngine.setAmbientSound(nextAmbient);
    onUpdateSettings({ ambientSound: nextAmbient });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#16100b] border-b border-[#3e2c1c] text-[#e3d7bf] shadow-lg select-none px-3 py-2 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Vintage Brand & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c89947] via-[#855726] to-[#422910] p-[2px] shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#18110b] flex items-center justify-center text-[#d4a853] font-bold text-xs tracking-tighter border border-[#855726]">
                1888
              </div>
            </div>
            <div className="hidden md:block">
              <h1 className="text-sm font-semibold tracking-wider font-playfair uppercase text-[#e8d5b5]">
                Remington & Quill
              </h1>
              <p className="text-[10px] text-[#9b7e5f] font-serif tracking-widest uppercase">
                Victorian Writing Bureau
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-[#3e2c1c] hidden sm:block" />

          {/* Manuscript Title / Inline Edit */}
          <div className="min-w-0">
            {isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} className="flex items-center gap-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={() => {
                    if (titleInput.trim()) onRenameTitle(titleInput.trim());
                    setIsEditingTitle(false);
                  }}
                  autoFocus
                  className="bg-[#241a12] border border-[#a87f43] rounded px-2 py-0.5 text-xs sm:text-sm text-[#f5ebd7] font-playfair focus:outline-none w-48 sm:w-64"
                />
              </form>
            ) : (
              <button
                onClick={() => {
                  setTitleInput(currentManuscript.title);
                  setIsEditingTitle(true);
                }}
                className="group flex items-center gap-1.5 text-left text-xs sm:text-sm font-playfair font-medium text-[#dfcfb4] hover:text-[#eec676] transition-colors truncate max-w-[140px] sm:max-w-xs"
                title="Click to rename manuscript"
              >
                <span className="truncate">{currentManuscript.title}</span>
                <span className="text-[10px] text-[#8e7355] group-hover:text-[#c49a45] opacity-60">✎</span>
              </button>
            )}

            {/* Autosave Wax Seal Indicator */}
            <div className="flex items-center gap-1.5 text-[10px] text-[#937b60]">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-[#d97706] animate-pulse' : 'bg-[#10b981]'}`} />
              <span className="hidden xs:inline">
                {isSaving ? 'Inscribing...' : 'Preserved Locally'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Ribbon & Sound Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Ink Ribbon Selector */}
          <div className="hidden lg:flex items-center gap-1 bg-[#221810] border border-[#3e2c1c] rounded-md p-1 text-[11px]">
            <span className="text-[#8e7355] px-1 text-[10px] uppercase tracking-wider font-serif">Ribbon:</span>
            <button
              onClick={() => onUpdateSettings({ ribbonColor: 'black' })}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                settings.ribbonColor === 'black'
                  ? 'bg-[#3b2a1c] text-[#f7eada] shadow-sm font-semibold'
                  : 'text-[#a38b72] hover:text-[#d5c3ab]'
              }`}
              title="Classic Black Ink Ribbon"
            >
              <span className="w-2 h-2 rounded-full bg-[#111] border border-[#555]" />
              Black
            </button>
            <button
              onClick={() => onUpdateSettings({ ribbonColor: 'crimson' })}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                settings.ribbonColor === 'crimson'
                  ? 'bg-[#3b2a1c] text-[#f87171] shadow-sm font-semibold'
                  : 'text-[#a38b72] hover:text-[#f87171]'
              }`}
              title="Victorian Crimson Ink Ribbon"
            >
              <span className="w-2 h-2 rounded-full bg-[#991b1b] border border-[#ef4444]" />
              Crimson
            </button>
            <button
              onClick={() => onUpdateSettings({ ribbonColor: 'sepia' })}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                settings.ribbonColor === 'sepia'
                  ? 'bg-[#3b2a1c] text-[#d97706] shadow-sm font-semibold'
                  : 'text-[#a38b72] hover:text-[#d97706]'
              }`}
              title="Aged Sepia Archival Ink"
            >
              <span className="w-2 h-2 rounded-full bg-[#78350f] border border-[#b45309]" />
              Sepia
            </button>
          </div>

          {/* Sound Master & Model Popover */}
          <div className="relative">
            <div className="flex items-center bg-[#221810] border border-[#3e2c1c] rounded-md overflow-hidden">
              <button
                onClick={() => {
                  toggleSoundMute();
                  if (settings.soundMuted) {
                    soundEngine.unlockAudio();
                    soundEngine.playKeyStroke('X');
                  }
                }}
                className={`p-1.5 sm:px-2 sm:py-1 flex items-center gap-1.5 text-xs transition-colors ${
                  settings.soundMuted
                    ? 'text-[#7e6955] hover:text-[#aa9177]'
                    : 'text-[#d4a853] hover:text-[#edd18f]'
                }`}
                title={settings.soundMuted ? 'Unmute Mechanical Sound' : 'Mute Mechanical Sound'}
              >
                {settings.soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden md:inline font-serif text-[11px]">
                  {settings.soundMuted ? 'Muted' : 'Mechanical Audio'}
                </span>
              </button>
              
              {/* Quick Test Key Button */}
              <button
                onClick={() => {
                  soundEngine.unlockAudio();
                  soundEngine.playKeyStroke('A');
                }}
                className="px-1.5 py-1 text-[10px] text-[#caa765] hover:text-[#fff] hover:bg-[#342417] border-l border-[#3a2818] font-mono"
                title="Test mechanical keystroke sound"
              >
                CLACK
              </button>

              <button
                onClick={() => setSoundMenuOpen(!soundMenuOpen)}
                className="px-1 py-1.5 border-l border-[#3a2818] text-[#9f856a] hover:text-[#e4cfb4]"
                title="Adjust typewriter audio and machine model"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sound Dropdown Popover */}
            {soundMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-72 bg-[#1f1610] border border-[#523b26] rounded-lg shadow-2xl p-3 z-50 text-xs text-[#d8c7ad]"
                onMouseLeave={() => setSoundMenuOpen(false)}
              >
                <div className="font-playfair font-semibold text-[#eacb88] pb-1 border-b border-[#3e2c1c] mb-2 flex items-center justify-between">
                  <span>Acoustic Configuration</span>
                  <span className="text-[10px] text-[#9f856a]">Physical Acoustic Model</span>
                </div>

                {/* Volume Slider */}
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] text-[#a99175] mb-1">
                    <span>Key Strike Volume</span>
                    <span>{Math.round(settings.soundVolume * 100)}%</span>
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
                    className="w-full accent-[#c49a45] cursor-pointer bg-[#312215] h-1.5 rounded"
                  />
                </div>

                {/* Quick Acoustic Test Row */}
                <div className="mb-3 p-1.5 bg-[#17100a] rounded border border-[#3e2c1c]">
                  <div className="text-[10px] text-[#9f856a] font-serif mb-1 uppercase tracking-wider">Test Mechanical Components:</div>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      onClick={() => {
                        soundEngine.unlockAudio();
                        soundEngine.playKeyStroke('X');
                      }}
                      className="py-1 bg-[#251910] hover:bg-[#3d2a1b] text-[#edd6b4] rounded text-[10px] font-mono border border-[#483321]"
                    >
                      Key
                    </button>
                    <button
                      onClick={() => {
                        soundEngine.unlockAudio();
                        soundEngine.playSpacebar();
                      }}
                      className="py-1 bg-[#251910] hover:bg-[#3d2a1b] text-[#edd6b4] rounded text-[10px] font-mono border border-[#483321]"
                    >
                      Space
                    </button>
                    <button
                      onClick={() => {
                        soundEngine.unlockAudio();
                        soundEngine.playCarriageReturn();
                      }}
                      className="py-1 bg-[#251910] hover:bg-[#3d2a1b] text-[#edd6b4] rounded text-[10px] font-mono border border-[#483321]"
                    >
                      Return
                    </button>
                    <button
                      onClick={() => {
                        soundEngine.unlockAudio();
                        soundEngine.playMarginBell();
                      }}
                      className="py-1 bg-[#251910] hover:bg-[#3d2a1b] text-[#eab308] rounded text-[10px] font-mono border border-[#483321]"
                    >
                      Bell 🔔
                    </button>
                  </div>
                </div>

                {/* Machine Model Selection */}
                <div className="mb-3">
                  <span className="block text-[11px] text-[#a99175] mb-1">Machine Mechanism</span>
                  <div className="grid grid-cols-1 gap-1">
                    {[
                      { id: 'remington1888', label: '1888 Heavy Remington No. 2', desc: 'Deep cast-iron impact & heavy platen thud' },
                      { id: 'royal1910', label: '1910 Royal Aristocrat', desc: 'Crisp mechanical snap & steel ringing' },
                      { id: 'underwood1930', label: '1930 Underwood No. 5', desc: 'Iconic newsroom rhythmic typewriter clack' },
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
                        className={`text-left p-1.5 rounded transition-all border ${
                          settings.soundModel === m.id
                            ? 'bg-[#3b2a1a] border-[#a27a3c] text-[#f7e6ca]'
                            : 'bg-[#18110b] border-transparent text-[#9f856a] hover:border-[#422d1c]'
                        }`}
                      >
                        <div className="font-semibold text-[11px] flex items-center justify-between">
                          <span>{m.label}</span>
                          {settings.soundModel === m.id && <span className="text-[10px] text-[#c49a45]">Active</span>}
                        </div>
                        <div className="text-[10px] text-[#7a644e]">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Margin Bell Toggle */}
                <div className="pt-2 border-t border-[#3e2c1c] flex items-center justify-between">
                  <span className="text-[11px] text-[#a99175]">Margin Warning Bell</span>
                  <button
                    onClick={() => {
                      const next = !settings.bellEnabled;
                      soundEngine.setBellEnabled(next);
                      if (next) {
                        soundEngine.unlockAudio();
                        soundEngine.playMarginBell();
                      }
                      onUpdateSettings({ bellEnabled: next });
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      settings.bellEnabled ? 'bg-[#c49a45] text-[#1a110a]' : 'bg-[#2f2217] text-[#7a644e]'
                    }`}
                  >
                    {settings.bellEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ambient Study Atmosphere Toggle */}
          <button
            onClick={cycleAmbient}
            className={`px-2 py-1 bg-[#221810] border border-[#3e2c1c] rounded-md text-xs flex items-center gap-1.5 transition-colors ${
              settings.ambientSound !== 'none'
                ? 'text-[#e5a952] border-[#7d5628]'
                : 'text-[#8e7355] hover:text-[#baa085]'
            }`}
            title={`Ambient Atmosphere: ${settings.ambientSound} (click to cycle: Fireplace / Rain / Clock / Off)`}
          >
            {settings.ambientSound === 'fireplace' && <Flame className="w-3.5 h-3.5 text-[#f97316]" />}
            {settings.ambientSound === 'rain' && <CloudRain className="w-3.5 h-3.5 text-[#38bdf8]" />}
            {settings.ambientSound === 'clock' && <Clock className="w-3.5 h-3.5 text-[#eab308]" />}
            {settings.ambientSound === 'none' && <Flame className="w-3.5 h-3.5 opacity-40" />}
            <span className="hidden sm:inline font-serif text-[11px] capitalize">
              {settings.ambientSound === 'none' ? 'Silence' : settings.ambientSound}
            </span>
          </button>

          {/* View Mode Toggle: Chassis vs Desk */}
          <button
            onClick={() => onUpdateSettings({ viewMode: settings.viewMode === 'chassis' ? 'desk' : 'chassis' })}
            className={`p-1.5 sm:px-2 sm:py-1 bg-[#221810] border border-[#3e2c1c] rounded-md text-xs flex items-center gap-1.5 transition-colors ${
              settings.viewMode === 'chassis' ? 'text-[#d4a853]' : 'text-[#8e7355] hover:text-[#d4a853]'
            }`}
            title={settings.viewMode === 'chassis' ? 'Switch to Distraction-Free Desk View' : 'Switch to Typewriter Chassis View'}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden xl:inline font-serif text-[11px]">
              {settings.viewMode === 'chassis' ? 'Chassis' : 'Desk'}
            </span>
          </button>
        </div>

        {/* Right: Modals & Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Victorian Lexicon & Prompts */}
          <button
            onClick={onOpenLexicon}
            className="p-1.5 sm:px-2.5 sm:py-1 bg-[#241a12] hover:bg-[#342417] border border-[#483321] hover:border-[#8b6537] rounded-md text-[#d5c1a5] transition-all flex items-center gap-1 text-xs"
            title="Victorian Lexicon, Archaic Thesaurus & Story Prompts"
          >
            <Feather className="w-3.5 h-3.5 text-[#d4a853]" />
            <span className="hidden md:inline font-serif">Lexicon</span>
          </button>

          {/* Folios / Manuscripts Library */}
          <button
            onClick={onOpenManuscripts}
            className="p-1.5 sm:px-2.5 sm:py-1 bg-[#241a12] hover:bg-[#342417] border border-[#483321] hover:border-[#8b6537] rounded-md text-[#d5c1a5] transition-all flex items-center gap-1 text-xs"
            title="Manuscripts Library (Offline Folios)"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#d4a853]" />
            <span className="hidden sm:inline font-serif">Folios</span>
          </button>

          {/* Typography & Appearance Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:px-2 sm:py-1 bg-[#241a12] hover:bg-[#342417] border border-[#483321] hover:border-[#8b6537] rounded-md text-[#d5c1a5] transition-all flex items-center gap-1 text-xs"
            title="Typography, Paper Styles, and Typewriter Settings"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-[#d4a853]" />
          </button>

          {/* Export PDF / DOCX */}
          <button
            onClick={onOpenExport}
            className="px-2.5 py-1 bg-gradient-to-r from-[#946c31] via-[#b68943] to-[#946c31] hover:from-[#a77b3a] hover:to-[#a77b3a] text-[#1c120a] font-serif font-bold rounded-md shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 text-xs border border-[#d3aa5d]"
            title="Export completed manuscript as PDF or Word (.docx)"
          >
            <Download className="w-3.5 h-3.5 text-[#1c120a]" />
            <span className="font-playfair tracking-wide">Export</span>
          </button>
        </div>

      </div>
    </header>
  );
};
