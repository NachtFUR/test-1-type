import React, { useRef, useEffect, useState } from 'react';
import { Manuscript, TypewriterSettings } from '../types/manuscript';
import { soundEngine } from '../utils/audioEngine';
import { VICTORIAN_ORNAMENTS } from '../utils/victorianLexicon';
import { Sparkles, AlignLeft, Bookmark } from 'lucide-react';

interface ParchmentEditorProps {
  manuscript: Manuscript;
  settings: TypewriterSettings;
  onChangeContent: (content: string) => void;
  onUpdateCursorCol: (col: number) => void;
  onCarriageReturnTriggered: () => void;
  onUpdateManuscript?: (updates: Partial<Manuscript>) => void;
}

const QUICK_PLACES = [
  'London, Autumn 1888',
  'Baker Street, City of London',
  'Whitechapel & Spitalfields, 1891',
  'Dartmoor Moors, Winter 1895',
  'Blackwood Manor, Yorkshire',
  'Fleet Street, City of London',
];

export const ParchmentEditor: React.FC<ParchmentEditorProps> = ({
  manuscript,
  settings,
  onChangeContent,
  onUpdateCursorCol,
  onCarriageReturnTriggered,
  onUpdateManuscript,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [stats, setStats] = useState({ words: 0, chars: 0, pages: 1, readingMins: 1 });
  const lastLineLengthRef = useRef(0);
  const bellRungForCurrentLineRef = useRef(false);

  // Header quick edit state
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerTitle, setHeaderTitle] = useState(manuscript.title);
  const [headerAuthor, setHeaderAuthor] = useState(manuscript.author);
  const [headerLocation, setHeaderLocation] = useState(manuscript.locationEra || 'London, Autumn 1888');
  const [headerSubtitle, setHeaderSubtitle] = useState(manuscript.subtitle || '');

  // Keep local header inputs in sync when manuscript changes
  useEffect(() => {
    setHeaderTitle(manuscript.title);
    setHeaderAuthor(manuscript.author);
    setHeaderLocation(manuscript.locationEra || 'London, Autumn 1888');
    setHeaderSubtitle(manuscript.subtitle || '');
  }, [manuscript.id]);

  const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateManuscript) {
      onUpdateManuscript({
        title: headerTitle.trim() || 'Untitled Folio',
        author: headerAuthor.trim() || 'Anonymous',
        locationEra: headerLocation.trim(),
        subtitle: headerSubtitle.trim(),
      });
    }
    setIsEditingHeader(false);
  };

  // Calculate statistics
  useEffect(() => {
    const text = manuscript.content || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    // Standard Victorian literary manuscript: 250 words per folio page
    const pages = Math.max(1, Math.ceil(words / 250));
    // Average reading speed 200 wpm
    const readingMins = Math.max(1, Math.ceil(words / 200));

    setStats({ words, chars, pages, readingMins });
  }, [manuscript.content]);

  // Update cursor column and line length tracking
  const updateCursorTracking = () => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const pos = el.selectionStart || 0;
    const textBefore = el.value.substring(0, pos);
    const lines = textBefore.split('\n');
    const currentLine = lines[lines.length - 1] || '';
    const col = currentLine.length;

    onUpdateCursorCol(col);

    // Margin Bell Logic: if user types past margin threshold on this line and bell hasn't rung yet
    if (col >= settings.bellMargin && !bellRungForCurrentLineRef.current) {
      soundEngine.playMarginBell();
      bellRungForCurrentLineRef.current = true;
    }

    lastLineLengthRef.current = col;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Unlock audio context on first user keydown
    soundEngine.unlockAudio();

    // Shift / CapsLock key alone
    if (e.key === 'Shift' || e.key === 'CapsLock') {
      soundEngine.playPaperKnob();
      return;
    }

    // Arrow navigation keys trigger platen ratchet clicks
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(e.key)) {
      soundEngine.playPaperKnob();
      return;
    }

    // Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      insertTextAtCursor('      '); // 6-space typewriter tab
      soundEngine.playSpacebar();
      return;
    }

    // Other modifier keys alone don't strike
    if (['Control', 'Alt', 'Meta', 'Escape'].includes(e.key)) {
      return;
    }

    if (e.key === 'Enter') {
      soundEngine.playCarriageReturn();
      onCarriageReturnTriggered();
      bellRungForCurrentLineRef.current = false;
      return;
    }

    if (e.key === ' ') {
      soundEngine.playSpacebar();
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      soundEngine.playBackspace();
      return;
    }

    // Standard character strike
    soundEngine.playKeyStroke(e.key);
  };

  const handleKeyUp = () => {
    updateCursorTracking();
  };

  const handleClick = () => {
    soundEngine.unlockAudio();
    updateCursorTracking();
  };

  const insertTextAtCursor = (insertVal: string) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;

    const nextVal = val.substring(0, start) + insertVal + val.substring(end);
    onChangeContent(nextVal);

    setTimeout(() => {
      el.selectionStart = el.selectionEnd = start + insertVal.length;
      el.focus();
      updateCursorTracking();
    }, 10);
  };

  // Determine paper styling class
  const getPaperClass = () => {
    switch (settings.paperStyle) {
      case 'victorian-vellum':
        return 'parchment-vellum';
      case 'tea-stained':
        return 'parchment-teastained';
      case 'fog-london':
        return 'parchment-fog';
      case 'aged-parchment':
      default:
        return 'parchment-aged';
    }
  };

  // Determine font styling class
  const getFontClass = () => {
    switch (settings.fontFamily) {
      case 'courier-prime':
        return 'font-courier-prime';
      case 'im-fell':
        return 'font-im-fell';
      case 'libre-baskerville':
        return 'font-baskerville';
      case 'special-elite':
      default:
        return 'font-special-elite';
    }
  };

  // Determine ink ribbon color
  const getRibbonColor = () => {
    switch (settings.ribbonColor) {
      case 'crimson':
        return '#7f1d1d'; // deep Victorian carmine
      case 'sepia':
        return '#451a03'; // deep aged sepia
      case 'black':
      default:
        return '#1c1917'; // carbon black
    }
  };

  return (
    <div className="relative">
      {/* Parchment Sheet */}
      <div
        className={`relative w-full rounded-sm p-6 sm:p-12 md:p-16 transition-all duration-300 ${getPaperClass()} deckle-edge`}
      >
        {/* Subtle Watermark or Embossed Victorian Monogram */}
        <div className="absolute top-8 right-8 pointer-events-none opacity-10 select-none flex flex-col items-center">
          <div className="text-4xl font-serif">VR</div>
          <div className="text-[9px] uppercase tracking-widest font-mono">Folio Rag</div>
        </div>

        {/* Ornate Header Filigree with Place & Quick Edit */}
        {settings.ornateHeaders && (
          <div className="relative group text-center mb-6 select-none border-b border-[#a47b4b]/30 pb-4">
            
            {/* Quick Header Edit Trigger Button */}
            {!isEditingHeader && (
              <button
                type="button"
                onClick={() => setIsEditingHeader(true)}
                className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded bg-[#402a16]/10 hover:bg-[#402a16]/20 border border-[#8f6b3e]/30 text-[10px] text-[#7a572c] font-serif cursor-pointer flex items-center gap-1"
                title="Edit Title, Author, and Place"
              >
                <span>✎ Edit Place & Title</span>
              </button>
            )}

            {isEditingHeader ? (
              <form onSubmit={handleSaveHeader} className="bg-[#eddcc3]/90 border-2 border-[#b58c50] p-4 rounded-lg shadow-lg text-left space-y-2.5 max-w-lg mx-auto">
                <div className="text-xs font-bold font-playfair uppercase text-[#5a3b1a] flex items-center justify-between border-b border-[#cca771]/50 pb-1">
                  <span>Customise Manuscript Header & Place</span>
                  <button
                    type="button"
                    onClick={() => setIsEditingHeader(false)}
                    className="text-[#8e683b] hover:text-[#3e240e] text-xs font-sans"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-serif text-[#6c4723]">Title</label>
                    <input
                      type="text"
                      value={headerTitle}
                      onChange={(e) => setHeaderTitle(e.target.value)}
                      className="w-full px-2 py-1 bg-[#fffbf2] border border-[#a87f4c] rounded text-xs text-[#2c1b0c] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-serif text-[#6c4723]">Author / Pen Name</label>
                    <input
                      type="text"
                      value={headerAuthor}
                      onChange={(e) => setHeaderAuthor(e.target.value)}
                      className="w-full px-2 py-1 bg-[#fffbf2] border border-[#a87f4c] rounded text-xs text-[#2c1b0c] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-serif text-[#6c4723]">Setting / Place & Era</label>
                  <input
                    type="text"
                    value={headerLocation}
                    onChange={(e) => setHeaderLocation(e.target.value)}
                    placeholder="e.g. London, Autumn 1888"
                    className="w-full px-2 py-1 bg-[#fffbf2] border border-[#a87f4c] rounded text-xs text-[#2c1b0c] focus:outline-none"
                  />
                  
                  {/* Quick place chips */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {QUICK_PLACES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setHeaderLocation(p)}
                        className={`text-[9px] px-1.5 py-0.5 rounded border ${
                          headerLocation === p
                            ? 'bg-[#8d6732] text-[#fff] border-[#5a3f1d]'
                            : 'bg-[#faf4e6] text-[#7a572c] border-[#cbb38e] hover:bg-[#ebd8b7]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-serif text-[#6c4723]">Subtitle (Optional)</label>
                  <input
                    type="text"
                    value={headerSubtitle}
                    onChange={(e) => setHeaderSubtitle(e.target.value)}
                    placeholder="Being a Record of Singular Occurrences"
                    className="w-full px-2 py-1 bg-[#fffbf2] border border-[#a87f4c] rounded text-xs text-[#2c1b0c] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditingHeader(false)}
                    className="px-2.5 py-1 text-xs text-[#7e572d] hover:text-[#38210d] font-serif"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#976a2e] hover:bg-[#b8863f] text-[#fff] font-serif font-bold text-xs rounded shadow"
                  >
                    Save Header
                  </button>
                </div>
              </form>
            ) : (
              <div 
                onClick={() => setIsEditingHeader(true)}
                className="cursor-pointer hover:bg-[#402a16]/5 p-2 rounded transition-colors"
                title="Click to customize title, place & author"
              >
                <div className="text-xs sm:text-sm tracking-widest text-[#5c3e1c] uppercase font-playfair font-bold">
                  {manuscript.title.toUpperCase()}
                </div>

                {manuscript.subtitle && (
                  <div className="text-[11px] text-[#7d562b] italic font-serif mt-0.5">
                    {manuscript.subtitle}
                  </div>
                )}

                <div className="text-[11px] text-[#7d562b] font-serif mt-0.5">
                  by <strong className="text-[#4e3215]">{manuscript.author || 'An Anonymous Writer'}</strong>
                </div>

                {manuscript.locationEra && (
                  <div className="text-[10px] text-[#8e683b] italic font-serif mt-0.5">
                    — {manuscript.locationEra} —
                  </div>
                )}

                <div className="text-[12px] text-[#aa8454] mt-1">❧ ~ ❦ ~ ❧</div>
              </div>
            )}

          </div>
        )}

        {/* Main Typewriter Text Area */}
        <textarea
          ref={textareaRef}
          value={manuscript.content}
          onChange={(e) => onChangeContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onClick={handleClick}
          spellCheck={false}
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineSpacing,
            color: getRibbonColor(),
            opacity: settings.inkDensity,
          }}
          className={`w-full min-h-[580px] sm:min-h-[700px] bg-transparent resize-y focus:outline-none transition-colors border-none p-0 ${getFontClass()} placeholder:text-[#9a8165]/50`}
          placeholder="Set your fingers upon the keys and inscribe your tale..."
        />

        {/* Quick Victorian Ornaments Bar */}
        <div className="mt-6 pt-3 border-t border-[#a87f4c]/25 flex flex-wrap items-center justify-between gap-2 text-xs text-[#7c5b36] select-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-serif uppercase tracking-wider text-[#8b653c] mr-1">
              Insert Ornaments:
            </span>
            {VICTORIAN_ORNAMENTS.slice(0, 6).map((glyph) => (
              <button
                key={glyph}
                onClick={() => {
                  insertTextAtCursor(`\n\n     ${glyph}\n\n`);
                  soundEngine.playKeyStroke('X');
                }}
                className="w-6 h-6 rounded bg-[#2e1d0e]/5 hover:bg-[#2e1d0e]/15 border border-[#8f693e]/30 flex items-center justify-center text-sm font-serif hover:scale-110 active:scale-95 transition-all text-[#65431f]"
                title={`Insert ${glyph}`}
              >
                {glyph}
              </button>
            ))}

            <button
              onClick={() => {
                insertTextAtCursor(`\n\nCHAPTER \n\n   `);
                soundEngine.playCarriageReturn();
              }}
              className="px-2 py-0.5 rounded bg-[#2e1d0e]/5 hover:bg-[#2e1d0e]/15 border border-[#8f693e]/30 text-[11px] font-serif hover:text-[#422a12] transition-colors"
            >
              + Chapter Header
            </button>
          </div>

          <div className="text-[11px] italic text-[#8d693f] font-serif">
            Warning bell sounds at column {settings.bellMargin}
          </div>
        </div>
      </div>

      {/* Manuscript Stats Ribbon Bar */}
      <div className="mt-3 bg-[#1e150f]/90 border border-[#443020] rounded-md px-4 py-2 flex flex-wrap items-center justify-between text-xs text-[#ab9276] select-none shadow">
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap font-serif">
          <div>
            <span className="text-[#e2cda7] font-semibold">{stats.words.toLocaleString()}</span> Words
          </div>
          <div>
            <span className="text-[#e2cda7] font-semibold">{stats.chars.toLocaleString()}</span> Characters
          </div>
          <div>
            <span className="text-[#e2cda7] font-semibold">{stats.pages}</span> {stats.pages === 1 ? 'Folio Page' : 'Folio Pages'}
          </div>
          <div className="hidden sm:inline">
            <span className="text-[#e2cda7] font-semibold">~{stats.readingMins}</span> min read
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-[#88694a] hidden md:inline">
            Typography: <strong className="text-[#d8be97] capitalize">{settings.fontFamily.replace('-', ' ')}</strong>
          </span>
          <span className="text-[#88694a]">
            Paper: <strong className="text-[#d8be97] capitalize">{settings.paperStyle.replace('-', ' ')}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
