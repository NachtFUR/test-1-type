import React, { useState } from 'react';
import { X, Search, Sparkles, Feather, Copy, Check, BookOpen, Lightbulb } from 'lucide-react';
import { VICTORIAN_LEXICON, VICTORIAN_STORY_PROMPTS, VictorianTerm } from '../utils/victorianLexicon';

interface LexiconDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText: (text: string) => void;
}

export const LexiconDrawer: React.FC<LexiconDrawerProps> = ({ isOpen, onClose, onInsertText }) => {
  const [activeTab, setActiveTab] = useState<'lexicon' | 'prompts'>('lexicon');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedWord, setCopiedWord] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Atmosphere', 'Society & Demeanor', 'Mystery & Danger', 'Victorian Slang & Wit', 'Places & Objects'];

  const filteredLexicon = VICTORIAN_LEXICON.filter((item) => {
    const matchesSearch = item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.example.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopiedWord(word);
    setTimeout(() => setCopiedWord(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-[#1a120c] border-l border-[#443020] text-[#ded0bc] h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-[#3b2818] flex items-center justify-between bg-[#20160f]">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-[#d4af37]" />
            <div>
              <h2 className="font-playfair font-bold text-base text-[#edd6b4]">Victorian Companion</h2>
              <p className="text-[11px] text-[#9a7e60] font-serif">Archaic lexicon & gothic story prompts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#9a7e60] hover:text-[#ecd2ad] hover:bg-[#2e1f14]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#352415] bg-[#17100a] text-xs">
          <button
            onClick={() => setActiveTab('lexicon')}
            className={`flex-1 py-2 font-serif font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'lexicon'
                ? 'border-[#c49a45] text-[#eedcc3] bg-[#22170e]'
                : 'border-transparent text-[#8d735a] hover:text-[#c49a45]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Victorian Lexicon</span>
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`flex-1 py-2 font-serif font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'prompts'
                ? 'border-[#c49a45] text-[#eedcc3] bg-[#22170e]'
                : 'border-transparent text-[#8d735a] hover:text-[#c49a45]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Gothic Prompts</span>
          </button>
        </div>

        {/* Tab 1: Victorian Lexicon */}
        {activeTab === 'lexicon' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search and filters */}
            <div className="p-3 bg-[#19110a] border-b border-[#362516] space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#7c634b]" />
                <input
                  type="text"
                  placeholder="Search archaic words or definitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#21160e] border border-[#3e2b1c] rounded text-xs text-[#eedec6] placeholder-[#6d553e] focus:outline-none focus:border-[#a87f43]"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-[10px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#8d6732] text-[#1a110a] font-bold'
                        : 'bg-[#241910] text-[#8e755c] hover:text-[#cdb397]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filteredLexicon.map((item) => (
                <div
                  key={item.word}
                  className="p-3 bg-[#20160f] border border-[#3c2a1b] hover:border-[#67482c] rounded-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-playfair font-bold text-sm text-[#edd8bb]">
                        {item.word}
                      </span>
                      <span className="ml-2 text-[10px] text-[#9a7e60] font-mono px-1.5 py-0.2 bg-[#2d1e13] rounded">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(item.word)}
                        className="p-1 text-[#8e7355] hover:text-[#d4af37]"
                        title="Copy word"
                      >
                        {copiedWord === item.word ? (
                          <Check className="w-3.5 h-3.5 text-[#10b981]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => onInsertText(` ${item.word} `)}
                        className="px-1.5 py-0.5 bg-[#342417] hover:bg-[#4a3421] text-[10px] font-serif text-[#eedac1] rounded border border-[#523b26]"
                        title="Insert word at cursor in manuscript"
                      >
                        + Insert
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#b8a084] mt-1 font-serif">
                    {item.definition}
                  </p>

                  <p className="text-[10px] text-[#83694f] italic mt-1.5 border-l-2 border-[#5a402a] pl-2 font-serif">
                    "{item.example}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Gothic Story Prompts */}
        {activeTab === 'prompts' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <p className="text-xs text-[#9f8569] font-serif italic pb-1 border-b border-[#312013]">
              Victorian plot seeds and atmospheric opening lines to spark your next penny dreadful or gaslamp mystery:
            </p>

            {VICTORIAN_STORY_PROMPTS.map((prompt, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#20160f] border border-[#3c2a1b] rounded-lg space-y-2 hover:border-[#67482c] transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-playfair font-bold text-sm text-[#edd8bb]">
                    {prompt.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#312115] text-[#d4af37] font-mono">
                    {prompt.genre}
                  </span>
                </div>

                <p className="text-xs text-[#baa186] font-serif">
                  {prompt.hook}
                </p>

                <div className="p-2 bg-[#17100a] rounded border border-[#2e1f13] text-[11px] text-[#cca978] italic font-serif">
                  "{prompt.firstLine}"
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onInsertText(`\n\n   ${prompt.firstLine} `)}
                    className="px-2.5 py-1 bg-[#8d6732] hover:bg-[#a4793b] text-[#1a110a] font-serif font-bold text-xs rounded transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Inscribe Opening Line</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-[#352415] text-[10px] text-[#7a6148] text-center font-serif bg-[#18100a]">
          ✦ Authentic 19th Century British English Vocabulary ✦
        </div>

      </div>
    </div>
  );
};
