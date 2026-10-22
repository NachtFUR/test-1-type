import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  FileText, 
  Trash2, 
  Copy, 
  Calendar, 
  Search, 
  Upload, 
  DownloadCloud,
  BookMarked
} from 'lucide-react';
import { Manuscript } from '../types/manuscript';

interface ManuscriptDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  manuscripts: Manuscript[];
  currentId: string;
  onSelectManuscript: (id: string) => void;
  onCreateManuscript: (title: string, author: string) => void;
  onDeleteManuscript: (id: string) => void;
  onDuplicateManuscript: (m: Manuscript) => void;
  onImportBackup: (jsonText: string) => void;
}

export const ManuscriptDrawer: React.FC<ManuscriptDrawerProps> = ({
  isOpen,
  onClose,
  manuscripts,
  currentId,
  onSelectManuscript,
  onCreateManuscript,
  onDeleteManuscript,
  onDuplicateManuscript,
  onImportBackup,
}) => {
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  if (!isOpen) return null;

  const filtered = manuscripts.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase()) ||
    m.author.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateManuscript(newTitle.trim(), newAuthor.trim() || 'An Anonymous Writer');
    setNewTitle('');
    setNewAuthor('');
    setShowCreateModal(false);
  };

  const handleExportAll = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(manuscripts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `victorian-folios-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportBackup(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-[#1a120c] border-l border-[#443020] text-[#ded0bc] h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 border-b border-[#3b2818] flex items-center justify-between bg-[#20160f]">
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-[#d4af37]" />
            <div>
              <h2 className="font-playfair font-bold text-base text-[#edd6b4]">Folios & Manuscripts</h2>
              <p className="text-[11px] text-[#9a7e60] font-serif">Saved in your local writing archive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#9a7e60] hover:text-[#ecd2ad] hover:bg-[#2e1f14]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Search */}
        <div className="p-3 border-b border-[#352415] space-y-2 bg-[#17100a]">
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 py-1.5 px-3 bg-gradient-to-r from-[#976a2e] to-[#b8863f] hover:from-[#aa7936] hover:to-[#ca9549] text-[#1c120a] font-serif font-bold text-xs rounded shadow flex items-center justify-center gap-1.5 border border-[#d3aa5d]"
            >
              <Plus className="w-4 h-4" />
              <span>Begin New Folio</span>
            </button>
            <button
              onClick={handleExportAll}
              className="p-1.5 bg-[#251a11] hover:bg-[#342417] border border-[#443020] text-[#caa875] rounded text-xs"
              title="Backup all folios to JSON"
            >
              <DownloadCloud className="w-4 h-4" />
            </button>
            <label
              className="p-1.5 bg-[#251a11] hover:bg-[#342417] border border-[#443020] text-[#caa875] rounded text-xs cursor-pointer flex items-center justify-center"
              title="Import JSON backup"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#7c634b]" />
            <input
              type="text"
              placeholder="Search by title, phrase, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#1f1610] border border-[#3e2b1c] rounded text-xs text-[#eedec6] placeholder-[#6d553e] focus:outline-none focus:border-[#a87f43]"
            />
          </div>
        </div>

        {/* New Folio Dialog */}
        {showCreateModal && (
          <form onSubmit={handleCreateSubmit} className="p-3 bg-[#241911] border-b border-[#4d3623] space-y-2">
            <div className="text-xs font-semibold font-playfair text-[#d9b87b]">Create New Manuscript</div>
            <input
              type="text"
              placeholder="Folio Title (e.g. The Silver Key of St. Paul's)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="w-full px-2 py-1 bg-[#1a110a] border border-[#523b26] rounded text-xs text-[#eedec6] focus:outline-none focus:border-[#c89947]"
            />
            <input
              type="text"
              placeholder="Author Byline (e.g. Arthur C. Sterling)"
              value={newAuthor}
              onChange={(e) => setNewAuthor(e.target.value)}
              className="w-full px-2 py-1 bg-[#1a110a] border border-[#523b26] rounded text-xs text-[#eedec6] focus:outline-none focus:border-[#c89947]"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-2 py-1 text-xs text-[#9a7e60] hover:text-[#d3bc9e]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-[#a57835] text-[#1c120a] font-serif font-bold text-xs rounded hover:bg-[#ba893f]"
              >
                Inscribe Folio
              </button>
            </div>
          </form>
        )}

        {/* Manuscript List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#79624b] text-xs font-serif">
              No manuscripts match your query.
            </div>
          ) : (
            filtered.map((m) => {
              const isSelected = m.id === currentId;
              const wordCount = m.content.trim() ? m.content.trim().split(/\s+/).length : 0;
              const dateStr = new Date(m.updatedAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectManuscript(m.id);
                    onClose();
                  }}
                  className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#291c13] border-[#a47b40] shadow-md ring-1 ring-[#a47b40]/50'
                      : 'bg-[#1e150e] border-[#382618] hover:border-[#5a3f29] hover:bg-[#231810]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-playfair font-semibold text-sm text-[#edd8bb] truncate group-hover:text-[#f4caa1]">
                        {m.title}
                      </h3>
                      <p className="text-[11px] text-[#93785d] font-serif italic truncate">
                        by {m.author}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateManuscript(m);
                        }}
                        className="p-1 hover:text-[#d4af37] text-[#8e7355]"
                        title="Duplicate folio"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {manuscripts.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you certain you wish to consign "${m.title}" to oblivion?`)) {
                              onDeleteManuscript(m.id);
                            }
                          }}
                          className="p-1 hover:text-[#ef4444] text-[#8e7355]"
                          title="Delete manuscript"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Excerpt */}
                  <p className="text-[11px] text-[#7c6652] line-clamp-2 mt-1.5 font-mono">
                    {m.content.slice(0, 120)}...
                  </p>

                  {/* Metadata footer */}
                  <div className="mt-2 pt-2 border-t border-[#312013] flex items-center justify-between text-[10px] text-[#8c7156]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#775a3e]" />
                      {dateStr}
                    </span>
                    <span className="font-mono text-[#a5896b]">
                      {wordCount.toLocaleString()} words
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#352415] text-[10px] text-[#7a6148] text-center font-serif bg-[#18100a]">
          ✦ All folios are preserved in your local browser cache ✦
        </div>

      </div>
    </div>
  );
};
