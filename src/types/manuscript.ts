export type TypewriterFont = 'special-elite' | 'courier-prime' | 'im-fell' | 'libre-baskerville';
export type PaperStyle = 'aged-parchment' | 'victorian-vellum' | 'tea-stained' | 'fog-london';
export type RibbonColor = 'black' | 'crimson' | 'sepia';
export type AmbientAtmosphere = 'none' | 'fireplace' | 'rain' | 'clock';
export type ViewMode = 'chassis' | 'desk';

export interface Manuscript {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  wordGoal?: number;
  locationEra?: string; // e.g. "Whitechapel, Autumn 1888"
  notes?: string;
}

export interface TypewriterSettings {
  fontFamily: TypewriterFont;
  paperStyle: PaperStyle;
  fontSize: number; // 16 to 24
  lineSpacing: number; // 1.6 to 2.4
  ribbonColor: RibbonColor;
  inkDensity: number; // 0.7 to 1.0
  soundModel: 'remington1888' | 'royal1910' | 'underwood1930';
  soundVolume: number;
  soundMuted: boolean;
  bellEnabled: boolean;
  bellMargin: number; // line char alert threshold, default 65
  ambientSound: AmbientAtmosphere;
  ambientVolume: number;
  viewMode: ViewMode;
  candleGlow: boolean;
  ornateHeaders: boolean;
  typebarAnimation: boolean;
}

export const DEFAULT_SETTINGS: TypewriterSettings = {
  fontFamily: 'special-elite',
  paperStyle: 'aged-parchment',
  fontSize: 18,
  lineSpacing: 1.85,
  ribbonColor: 'black',
  inkDensity: 0.95,
  soundModel: 'remington1888',
  soundVolume: 0.85,
  soundMuted: false,
  bellEnabled: true,
  bellMargin: 65,
  ambientSound: 'fireplace',
  ambientVolume: 0.35,
  viewMode: 'chassis',
  candleGlow: true,
  ornateHeaders: true,
  typebarAnimation: true,
};
