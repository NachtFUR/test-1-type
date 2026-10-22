import { Manuscript, TypewriterSettings, DEFAULT_SETTINGS } from '../types/manuscript';

const STORAGE_KEY_MANUSCRIPTS = 'victorian_typewriter_manuscripts_v1';
const STORAGE_KEY_CURRENT_ID = 'victorian_typewriter_current_id_v1';
const STORAGE_KEY_SETTINGS = 'victorian_typewriter_settings_v1';

const INITIAL_MANUSCRIPT: Manuscript = {
  id: 'manuscript-sample-1888',
  title: 'The Enigma of Blackwood Manor',
  subtitle: 'A Tale of Fog, Gears, and Secrets',
  author: 'Lord Percival Sterling',
  locationEra: 'London, Autumn 1888',
  notes: 'Dramatis Personae: Inspector Abernathy, Miss Genevieve Thorne, and the Clockmaker of Fleet Street.',
  createdAt: Date.now() - 86400000 * 3,
  updatedAt: Date.now() - 3600000,
  wordGoal: 2500,
  content: `CHAPTER I.
THE COURIER IN THE FOG

   The gas lamps along Baker Street flickered feebly in the impenetrable pea-soup fog that rolled off the Thames like cold shroud-cloth. It was the seventeenth of November, in the fifty-first year of Her Majesty's reign, and London was choked in soot and silence.

   Inside the drawing room of No. 9 Moray Place, the coals settled in the brass grate with a quiet hiss. I sat at my mahogany secretary, the carriage of my Remington No. 2 typewriter poised before a fresh leaf of rag vellum.

   A sharp rap struck the oak door below—three measured blows, followed by the clink of a brass ring.

   "A visitor at this ungodly hour?" murmured Abernathy, pausing with his silver pocket watch suspended mid-wind. "No gentleman walks the streets past midnight in this shroud, save for scoundrels, constables, and men who fear the morning light."

   Before I could answer, Mrs. Hudson’s trembling step sounded upon the stair. In her hand she held a wax-sealed envelope, bordered in mourning black and stamped with the sigil of an owl clasping an iron key...`,
};

export function loadAllManuscripts(): Manuscript[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MANUSCRIPTS);
    if (!raw) {
      saveAllManuscripts([INITIAL_MANUSCRIPT]);
      return [INITIAL_MANUSCRIPT];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [INITIAL_MANUSCRIPT];
  } catch (e) {
    console.error('Failed to load manuscripts from storage', e);
    return [INITIAL_MANUSCRIPT];
  }
}

export function saveAllManuscripts(manuscripts: Manuscript[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MANUSCRIPTS, JSON.stringify(manuscripts));
  } catch (e) {
    console.error('Failed to save manuscripts to storage', e);
  }
}

export function loadCurrentManuscriptId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_CURRENT_ID);
    if (id) return id;
  } catch {
    // ignore
  }
  return INITIAL_MANUSCRIPT.id;
}

export function saveCurrentManuscriptId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_ID, id);
  } catch {
    // ignore
  }
}

export function loadSettings(): TypewriterSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: TypewriterSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function createNewManuscript(title = 'Untitled Folio', author = 'An Anonymous Author'): Manuscript {
  const newManuscript: Manuscript = {
    id: `manuscript-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    subtitle: 'Being a Record of Singular Occurrences',
    author,
    locationEra: 'London, 1891',
    content: `CHAPTER I.\n\n   `,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    wordGoal: 1000,
  };

  const list = loadAllManuscripts();
  list.unshift(newManuscript);
  saveAllManuscripts(list);
  saveCurrentManuscriptId(newManuscript.id);
  return newManuscript;
}
