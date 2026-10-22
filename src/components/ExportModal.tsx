import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  FileText, 
  Check, 
  Sparkles, 
  Printer, 
  MapPin, 
  PenTool, 
  Sliders, 
  Eye, 
  Bookmark, 
  Clock 
} from 'lucide-react';
import { Manuscript } from '../types/manuscript';
import { exportToPDF, exportToDocx, exportToPlainText, exportToMarkdown } from '../utils/exporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  manuscript: Manuscript;
  onUpdateManuscript?: (updates: Partial<Manuscript>) => void;
}

const VICTORIAN_PLACE_PRESETS = [
  'London, Autumn 1888',
  'Baker Street, City of London',
  'Whitechapel & Spitalfields, 1891',
  'Scotland Yard CID, Westminster',
  'Dartmoor Moors, Winter 1895',
  'Blackwood Manor, Yorkshire',
  'Fleet Street, City of London',
  'The Diogenes Club, Pall Mall',
];

const CATEGORY_PRESETS = [
  'AN ORIGINAL MANUSCRIPT',
  'A GOTHIC CHRONICLE',
  'A PRIVATE INQUIRY REPORT',
  'PENNY DREADFUL TALE',
  'CONFIDENTIAL DISPATCH',
  'A VICTORIAN ROMANCE',
];

export const ExportModal: React.FC<ExportModalProps> = ({ 
  isOpen, 
  onClose, 
  manuscript,
  onUpdateManuscript 
}) => {
  const [includeCoverPage, setIncludeCoverPage] = useState(true);
  const [parchmentTone, setParchmentTone] = useState(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Customizable Header Fields
  const [customTitle, setCustomTitle] = useState(manuscript.title);
  const [customAuthor, setCustomAuthor] = useState(manuscript.author);
  const [customSubtitle, setCustomSubtitle] = useState(manuscript.subtitle || '');
  const [customLocationEra, setCustomLocationEra] = useState(manuscript.locationEra || 'London, Autumn 1888');
  const [coverCategory, setCoverCategory] = useState('AN ORIGINAL MANUSCRIPT');
  const [runningHeaderLeft, setRunningHeaderLeft] = useState(manuscript.title);
  const [runningHeaderRight, setRunningHeaderRight] = useState(manuscript.locationEra || 'LONDON, 1888');
  const [coverSealNote, setCoverSealNote] = useState('TRANSCRIBED ON REMINGTON TYPEWRITER No. 2 • PRINTED IN THE CITY OF LONDON');
  const [saveToFolio, setSaveToFolio] = useState(true);
  const [showAdvancedHeaders, setShowAdvancedHeaders] = useState(false);

  if (!isOpen) return null;

  const words = manuscript.content.trim() ? manuscript.content.trim().split(/\s+/).length : 0;
  const estimatedPages = Math.max(1, Math.ceil(words / 250));

  const applyFolioUpdatesIfRequested = () => {
    if (saveToFolio && onUpdateManuscript) {
      onUpdateManuscript({
        title: customTitle,
        author: customAuthor,
        subtitle: customSubtitle,
        locationEra: customLocationEra,
      });
    }
  };

  const handlePDF = async () => {
    try {
      setIsExporting('pdf');
      applyFolioUpdatesIfRequested();
      await exportToPDF(manuscript, {
        includeCoverPage,
        parchmentTone,
        customTitle,
        customAuthor,
        customSubtitle,
        customLocationEra,
        coverCategory,
        coverSealNote,
        runningHeaderLeft,
        runningHeaderRight,
      });
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      setIsExporting(null);
    }
  };

  const handleDocx = async () => {
    try {
      setIsExporting('docx');
      applyFolioUpdatesIfRequested();
      await exportToDocx(manuscript, {
        customTitle,
        customAuthor,
        customSubtitle,
        customLocationEra,
        runningHeaderLeft: `${customAuthor} / ${customTitle.toUpperCase()}`,
        runningHeaderRight: customLocationEra,
      });
    } catch (e) {
      console.error('DOCX export failed', e);
    } finally {
      setIsExporting(null);
    }
  };

  const handleTxt = () => {
    applyFolioUpdatesIfRequested();
    exportToPlainText(manuscript, {
      title: customTitle,
      author: customAuthor,
      locationEra: customLocationEra,
    });
  };

  const handleMd = () => {
    applyFolioUpdatesIfRequested();
    exportToMarkdown(manuscript, {
      title: customTitle,
      author: customAuthor,
      locationEra: customLocationEra,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 select-none">
      <div className="w-full max-w-2xl bg-[#1c140d] border-2 border-[#543b24] rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-[#ded0bc] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#3b2818] flex items-center justify-between bg-[#231810]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c89947] to-[#5a3816] flex items-center justify-center text-[#18110b] font-bold shadow">
              <Printer className="w-4 h-4 text-[#1a110a]" />
            </div>
            <div>
              <h2 className="font-playfair font-bold text-base sm:text-lg text-[#edd8bb]">
                Export Manuscript & Customize Headers
              </h2>
              <p className="text-[11px] text-[#9a7e60] font-serif">
                Configure place names, era dating, bylines, and running headers for your PDF
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

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Section 1: Live Header Preview Card */}
          <div className="bg-[#f7eedc] text-[#2c1d11] p-4 rounded-md border-2 border-[#b89154] shadow-md relative overflow-hidden">
            <div className="absolute top-1 right-2 text-[9px] font-mono uppercase tracking-widest text-[#946a36] font-bold">
              PDF Header Preview
            </div>

            <div className="text-center space-y-1">
              <div className="text-[10px] tracking-widest uppercase font-serif text-[#875d2f] font-semibold">
                {coverCategory.toUpperCase()}
              </div>

              <div className="text-base sm:text-lg font-bold font-playfair uppercase text-[#23150b] tracking-wide">
                {customTitle.toUpperCase() || 'UNTITLED FOLIO'}
              </div>

              {customSubtitle && (
                <div className="text-xs italic font-serif text-[#6d4d29]">
                  {customSubtitle}
                </div>
              )}

              <div className="text-[11px] text-[#aa8454] my-0.5">❧ ~ ❦ ~ ❧</div>

              <div className="text-xs font-serif text-[#4a3420]">
                by <strong className="text-[#2b190c]">{customAuthor || 'Anonymous'}</strong>
              </div>

              {customLocationEra && (
                <div className="text-[11px] italic font-serif text-[#805429]">
                  — {customLocationEra} —
                </div>
              )}
            </div>

            {/* Running Header Bar Preview */}
            <div className="mt-3 pt-2 border-t border-[#8f6b3e]/30 flex justify-between text-[9px] font-mono text-[#7b572e]">
              <span>HEADER L: {runningHeaderLeft || customTitle.toUpperCase()}</span>
              <span>HEADER R: {runningHeaderRight || customLocationEra.toUpperCase()}</span>
            </div>
          </div>

          {/* Section 2: Header & Place Customization Form */}
          <div className="bg-[#23170e] border border-[#483321] rounded-lg p-3.5 sm:p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#3a2818] pb-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Place, Era & Folio Byline</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedHeaders(!showAdvancedHeaders)}
                className="text-[11px] text-[#caa765] hover:text-[#fff] underline cursor-pointer"
              >
                {showAdvancedHeaders ? 'Simple Headers' : 'Advanced Running Headers'}
              </button>
            </div>

            {/* Title & Author Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#baa186] font-serif mb-1">
                  Manuscript Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => {
                    setCustomTitle(e.target.value);
                    setRunningHeaderLeft(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 bg-[#17100a] border border-[#4d3622] rounded text-xs text-[#eedec6] focus:outline-none focus:border-[#c89947]"
                  placeholder="The Enigma of Blackwood Manor"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#baa186] font-serif mb-1">
                  Author / Pen Name
                </label>
                <input
                  type="text"
                  value={customAuthor}
                  onChange={(e) => setCustomAuthor(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#17100a] border border-[#4d3622] rounded text-xs text-[#eedec6] focus:outline-none focus:border-[#c89947]"
                  placeholder="Lord Percival Sterling"
                />
              </div>
            </div>

            {/* Place / Era Dating Header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-[#baa186] font-serif flex items-center gap-1">
                  <span>Setting / Place & Era Dating:</span>
                </label>
                <span className="text-[10px] text-[#8e7355]">Appears on cover & running pages</span>
              </div>
              
              <input
                type="text"
                value={customLocationEra}
                onChange={(e) => {
                  setCustomLocationEra(e.target.value);
                  setRunningHeaderRight(e.target.value);
                }}
                className="w-full px-2.5 py-1.5 bg-[#17100a] border border-[#4d3622] rounded text-xs text-[#eedec6] focus:outline-none focus:border-[#c89947]"
                placeholder="e.g. London, Autumn 1888 or Baker Street, City of London"
              />

              {/* Victorian Place Quick-Chips */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="text-[10px] text-[#8e7355] font-serif">Quick Places:</span>
                {VICTORIAN_PLACE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setCustomLocationEra(preset);
                      setRunningHeaderRight(preset.toUpperCase());
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-serif transition-colors border ${
                      customLocationEra === preset
                        ? 'bg-[#8d6732] text-[#1a110a] border-[#d4af37] font-semibold'
                        : 'bg-[#1a110a] text-[#8f755e] border-[#382618] hover:text-[#ded0bc] hover:border-[#674b2f]'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Running Header options */}
            {showAdvancedHeaders && (
              <div className="pt-2 border-t border-[#3a2818] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#baa186] font-serif mb-1">
                      Header Category Label
                    </label>
                    <input
                      type="text"
                      value={coverCategory}
                      onChange={(e) => setCoverCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#17100a] border border-[#4d3622] rounded text-xs text-[#eedec6] focus:outline-none focus:border-[#c89947]"
                      placeholder="AN ORIGINAL MANUSCRIPT"
                    />
                    <div className="flex flex-wrap gap-1 mt-1">
                      {CATEGORY_PRESETS.slice(0, 3).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCoverCategory(cat)}
                          className="text-[9px] px-1.5 py-0.5 bg-[#17100a] text-[#8e7355] hover:text-[#d4af37] rounded border border-[#382618]"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#baa186] font-serif mb-1">
                      Folio Subtitle (Optional)
                    </label>
                    <input
                      type="text"
                      value={customSubtitle}
                      onChange={(e) => setCustomSubtitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#17100a] border border-[#4d3622] rounded text-xs text-[#eedec6] focus:outline-none focus:border-[#c89947]"
                      placeholder="Being a Record of Singular Occurrences"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#baa186] font-serif mb-1">
                      Body Page Left Header
                    </label>
                    <input
                      type="text"
                      value={runningHeaderLeft}
                      onChange={(e) => setRunningHeaderLeft(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#17100a] border border-[#4d3622] rounded text-xs text-[#eedec6] focus:outline-none focus:border-[#c89947]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#baa186] font-serif mb-1">
                      Body Page Right Header
                    </label>
                    <input
                      type="text"
                      value={runningHeaderRight}
                      onChange={(e) => setRunningHeaderRight(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#17100a] border border-[#4d3622] rounded text-xs text-[#eedec6] focus:outline-none focus:border-[#c89947]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#baa186] font-serif mb-1">
                    Bottom Imprint & Printing Press Seal
                  </label>
                  <input
                    type="text"
                    value={coverSealNote}
                    onChange={(e) => setCoverSealNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#17100a] border border-[#4d3622] rounded text-xs text-[#eedec6] focus:outline-none focus:border-[#c89947]"
                  />
                </div>
              </div>
            )}

            {/* Checkbox to persist to current manuscript */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#baa186]">
                <input
                  type="checkbox"
                  checked={saveToFolio}
                  onChange={(e) => setSaveToFolio(e.target.checked)}
                  className="accent-[#c49a45] rounded"
                />
                <span>Save these place & title edits directly to this Folio</span>
              </label>
            </div>
          </div>

          {/* Section 3: Export Format Action Cards */}
          <div className="space-y-3">
            
            {/* Primary: Victorian PDF */}
            <div className="border border-[#4f3823] bg-[#22170f] rounded-lg p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#972b2b]/30 border border-[#b91c1c]/40 text-[#fca5a5] text-[10px] font-mono font-bold">
                    PDF
                  </span>
                  <span className="font-playfair font-semibold text-sm text-[#edd8bb]">
                    Victorian Typeset PDF
                  </span>
                </div>
                <button
                  onClick={handlePDF}
                  disabled={isExporting === 'pdf'}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-[#946c31] via-[#b68943] to-[#946c31] hover:brightness-110 text-[#1a110a] font-serif font-bold text-xs rounded shadow flex items-center gap-1.5 transition-all border border-[#d3aa5d] cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>{isExporting === 'pdf' ? 'Typesetting PDF...' : 'Download Custom PDF'}</span>
                </button>
              </div>

              <p className="text-[11px] text-[#937b62] font-serif">
                Prints with your custom place header, author byline, formal double-borders, and running page margins.
              </p>

              {/* PDF Appearance Toggles */}
              <div className="pt-2 border-t border-[#3a281a] flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#baa286]">
                  <input
                    type="checkbox"
                    checked={includeCoverPage}
                    onChange={(e) => setIncludeCoverPage(e.target.checked)}
                    className="accent-[#c49a45] rounded"
                  />
                  <span>Include Victorian Title Cover Plate</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#baa286]">
                  <input
                    type="checkbox"
                    checked={parchmentTone}
                    onChange={(e) => setParchmentTone(e.target.checked)}
                    className="accent-[#c49a45] rounded"
                  />
                  <span>Warm Parchment Tone Background</span>
                </label>
              </div>
            </div>

            {/* Word (.docx) */}
            <div className="border border-[#4f3823] bg-[#22170f] rounded-lg p-3.5 sm:p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#1e40af]/30 border border-[#3b82f6]/40 text-[#93c5fd] text-[10px] font-mono font-bold">
                    DOCX
                  </span>
                  <span className="font-playfair font-semibold text-sm text-[#edd8bb]">
                    Standard Word Manuscript (.docx)
                  </span>
                </div>
                <button
                  onClick={handleDocx}
                  disabled={isExporting === 'docx'}
                  className="px-3 py-1.5 bg-[#2d1e13] hover:bg-[#3d2a1b] text-[#eedec6] border border-[#715031] font-serif font-semibold text-xs rounded shadow flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>{isExporting === 'docx' ? 'Packaging DOCX...' : 'Download .DOCX'}</span>
                </button>
              </div>

              <p className="text-[11px] text-[#937b62] font-serif">
                Literary submission format with running headers ({customTitle.slice(0, 24)} / {customAuthor}), place byline, and Courier New typography.
              </p>
            </div>

            {/* Plain Text & Markdown */}
            <div className="flex gap-2">
              <button
                onClick={handleTxt}
                className="flex-1 p-2 bg-[#21160e] hover:bg-[#2e1f14] border border-[#3f2b1a] rounded text-xs text-[#b89e81] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#a88258]" />
                <span>Plain Text (.txt)</span>
              </button>
              <button
                onClick={handleMd}
                className="flex-1 p-2 bg-[#21160e] hover:bg-[#2e1f14] border border-[#3f2b1a] rounded text-xs text-[#b89e81] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#a88258]" />
                <span>Markdown (.md)</span>
              </button>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#18100a] border-t border-[#352415] flex justify-between items-center text-xs">
          <span className="text-[11px] text-[#7a644f] font-serif">
            {words.toLocaleString()} words • ~{estimatedPages} folio pages
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-[#a98e72] hover:text-[#eedcc3] font-serif"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};
