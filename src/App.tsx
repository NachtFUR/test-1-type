import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { TypewriterChassis } from './components/TypewriterChassis';
import { ParchmentEditor } from './components/ParchmentEditor';
import { ManuscriptDrawer } from './components/ManuscriptDrawer';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { LexiconDrawer } from './components/LexiconDrawer';
import { Manuscript, TypewriterSettings } from './types/manuscript';
import { 
  loadAllManuscripts, 
  saveAllManuscripts, 
  loadCurrentManuscriptId, 
  saveCurrentManuscriptId, 
  loadSettings, 
  saveSettings,
  createNewManuscript
} from './utils/storage';
import { soundEngine } from './utils/audioEngine';

export default function App() {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>(() => loadAllManuscripts());
  const [currentId, setCurrentId] = useState<string>(() => loadCurrentManuscriptId());
  const [settings, setSettings] = useState<TypewriterSettings>(() => loadSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [cursorColumn, setCursorColumn] = useState(0);
  const [isLeverPulling, setIsLeverPulling] = useState(false);

  // Modals
  const [isManuscriptsOpen, setIsManuscriptsOpen] = useState(false);
  const [isLexiconOpen, setIsLexiconOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const saveTimerRef = useRef<number | null>(null);

  // Ensure current manuscript exists
  const currentManuscript = manuscripts.find((m) => m.id === currentId) || manuscripts[0];

  // Initialize sound settings on load
  useEffect(() => {
    soundEngine.setVolume(settings.soundVolume);
    soundEngine.setMuted(settings.soundMuted);
    soundEngine.setModel(settings.soundModel);
    soundEngine.setBellEnabled(settings.bellEnabled);
    soundEngine.setAmbientVolume(settings.ambientVolume);
  }, []);

  // Update settings handler
  const handleUpdateSettings = (partial: Partial<TypewriterSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  };

  // Content change handler with debounced autosave
  const handleContentChange = useCallback((newContent: string) => {
    setIsSaving(true);
    setManuscripts((prevList) => {
      const updated = prevList.map((m) =>
        m.id === currentManuscript.id
          ? { ...m, content: newContent, updatedAt: Date.now() }
          : m
      );

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = window.setTimeout(() => {
        saveAllManuscripts(updated);
        setIsSaving(false);
      }, 500);

      return updated;
    });
  }, [currentManuscript.id]);

  // Update manuscript details (title, author, locationEra, subtitle, etc.)
  const handleUpdateManuscript = (updates: Partial<Manuscript>) => {
    setManuscripts((prevList) => {
      const updated = prevList.map((m) =>
        m.id === currentManuscript.id
          ? { ...m, ...updates, updatedAt: Date.now() }
          : m
      );
      saveAllManuscripts(updated);
      return updated;
    });
  };

  // Rename current manuscript
  const handleRenameTitle = (newTitle: string) => {
    handleUpdateManuscript({ title: newTitle });
  };

  // Switch manuscript
  const handleSelectManuscript = (id: string) => {
    setCurrentId(id);
    saveCurrentManuscriptId(id);
    setCursorColumn(0);
    soundEngine.playPaperKnob();
  };

  // Create new manuscript
  const handleCreateManuscript = (title: string, author: string) => {
    const newDoc = createNewManuscript(title, author);
    setManuscripts(loadAllManuscripts());
    setCurrentId(newDoc.id);
    soundEngine.playCarriageReturn();
  };

  // Delete manuscript
  const handleDeleteManuscript = (id: string) => {
    const updated = manuscripts.filter((m) => m.id !== id);
    if (updated.length > 0) {
      setManuscripts(updated);
      saveAllManuscripts(updated);
      if (currentId === id) {
        setCurrentId(updated[0].id);
        saveCurrentManuscriptId(updated[0].id);
      }
    }
  };

  // Duplicate manuscript
  const handleDuplicateManuscript = (m: Manuscript) => {
    const dupe: Manuscript = {
      ...m,
      id: `manuscript-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${m.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const nextList = [dupe, ...manuscripts];
    setManuscripts(nextList);
    saveAllManuscripts(nextList);
    setCurrentId(dupe.id);
    saveCurrentManuscriptId(dupe.id);
  };

  // Import backup
  const handleImportBackup = (jsonText: string) => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
        setManuscripts(parsed);
        saveAllManuscripts(parsed);
        setCurrentId(parsed[0].id);
        saveCurrentManuscriptId(parsed[0].id);
        alert(`Successfully imported ${parsed.length} Victorian folios.`);
      } else {
        alert('Invalid manuscript archive file.');
      }
    } catch (e) {
      alert('Could not parse JSON archive.');
    }
  };

  // Trigger Carriage return lever animation
  const handleCarriageReturnTrigger = () => {
    setIsLeverPulling(true);
    setTimeout(() => setIsLeverPulling(false), 360);
  };

  // Manual lever pull click
  const handleManualLeverPull = () => {
    soundEngine.playCarriageReturn();
    handleCarriageReturnTrigger();
    // Append newline to content
    handleContentChange(currentManuscript.content + '\n   ');
  };

  // Insert text from Lexicon or Prompts
  const handleInsertText = (text: string) => {
    handleContentChange(currentManuscript.content + text);
    soundEngine.playKeyStroke('X');
  };

  return (
    <div className="min-h-screen wood-bureau text-[#ded0bc] flex flex-col relative selection:bg-[#c49a45]/30 selection:text-[#18110b]">
      
      {/* Victorian Candlelight Glow Effect */}
      {settings.candleGlow && (
        <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full bg-[#f59e0b]/10 blur-[130px] candle-glow-light pointer-events-none z-10" />
      )}

      {/* Top Victorian Navbar */}
      <Navbar
        currentManuscript={currentManuscript}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenManuscripts={() => setIsManuscriptsOpen(true)}
        onOpenLexicon={() => setIsLexiconOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onRenameTitle={handleRenameTitle}
        isSaving={isSaving}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 flex flex-col justify-start items-center p-2 sm:p-4 md:p-6 overflow-x-hidden">
        
        {/* Typewriter Chassis / Desk Container */}
        <TypewriterChassis
          settings={settings}
          cursorColumn={cursorColumn}
          isLeverPulling={isLeverPulling}
          onCarriageReturn={handleManualLeverPull}
        >
          <ParchmentEditor
            manuscript={currentManuscript}
            settings={settings}
            onChangeContent={handleContentChange}
            onUpdateCursorCol={setCursorColumn}
            onCarriageReturnTriggered={handleCarriageReturnTrigger}
            onUpdateManuscript={handleUpdateManuscript}
          />
        </TypewriterChassis>

      </main>

      {/* Footer Details */}
      <footer className="py-3 px-4 border-t border-[#312013] text-center text-xs text-[#7b6148] font-serif select-none bg-[#120c08]">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Remington & Quill • Mechanical Keystroke Sound Synthesizer & Victorian Writing Studio</span>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-[#c49a45] transition-colors"
            >
              Machine: {settings.soundModel.toUpperCase()}
            </button>
            <span>•</span>
            <span className="text-[#a5845c]">Offline Storage Active</span>
          </div>
        </div>
      </footer>

      {/* Manuscripts Folios Drawer */}
      <ManuscriptDrawer
        isOpen={isManuscriptsOpen}
        onClose={() => setIsManuscriptsOpen(false)}
        manuscripts={manuscripts}
        currentId={currentManuscript.id}
        onSelectManuscript={handleSelectManuscript}
        onCreateManuscript={handleCreateManuscript}
        onDeleteManuscript={handleDeleteManuscript}
        onDuplicateManuscript={handleDuplicateManuscript}
        onImportBackup={handleImportBackup}
      />

      {/* Victorian Lexicon & Prompts Drawer */}
      <LexiconDrawer
        isOpen={isLexiconOpen}
        onClose={() => setIsLexiconOpen(false)}
        onInsertText={handleInsertText}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Export Manuscript Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        manuscript={currentManuscript}
        onUpdateManuscript={handleUpdateManuscript}
      />

    </div>
  );
}
