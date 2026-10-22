export interface VictorianTerm {
  word: string;
  category: 'Atmosphere' | 'Society & Demeanor' | 'Mystery & Danger' | 'Victorian Slang & Wit' | 'Places & Objects';
  definition: string;
  example: string;
}

export const VICTORIAN_LEXICON: VictorianTerm[] = [
  {
    word: 'Pea-souper',
    category: 'Atmosphere',
    definition: 'A suffocating, yellowish London fog laden with coal smoke and soot.',
    example: 'A treacherous pea-souper had descended over the wharves of Wapping.',
  },
  {
    word: 'Countenance',
    category: 'Society & Demeanor',
    definition: 'A person’s facial expression or general demeanor.',
    example: 'His solemn countenance betrayed not an ounce of remorse.',
  },
  {
    word: 'Peradventure',
    category: 'Society & Demeanor',
    definition: 'Perhaps; by chance; uncertainty or doubt.',
    example: 'Peradventure the gentleman will reconsider his hasty proposition.',
  },
  {
    word: 'Balderdash',
    category: 'Victorian Slang & Wit',
    definition: 'Senseless talk, utter nonsense, or frivolous rubbish.',
    example: '"Complete and utter balderdash!" bellowed the magistrate.',
  },
  {
    word: 'Fortnight',
    category: 'Places & Objects',
    definition: 'A period of two weeks.',
    example: 'The steamer from Bombay is expected to arrive within a fortnight.',
  },
  {
    word: 'Hansome Cab',
    category: 'Places & Objects',
    definition: 'A two-wheeled, horse-drawn carriage with the driver seated high behind.',
    example: 'We hailed a hansome cab and bade the driver hasten to Paddington.',
  },
  {
    word: 'Apothecary',
    category: 'Places & Objects',
    definition: 'A medical professional who prepared and sold tinctures, tonics, and poisons.',
    example: 'The apothecary produced a small vial of laudanum wrapped in brown paper.',
  },
  {
    word: 'Scoundrel',
    category: 'Mystery & Danger',
    definition: 'A dishonest or unscrupulous person; rogue.',
    example: 'The elusive scoundrel vanished into the labyrinth of Seven Dials.',
  },
  {
    word: 'Constabulary',
    category: 'Mystery & Danger',
    definition: 'The police force or a designated body of constables.',
    example: 'The local constabulary was utterly baffled by the locked-room mystery.',
  },
  {
    word: 'Melancholy',
    category: 'Atmosphere',
    definition: 'A deep, pensive, and long-lasting sadness or gloom.',
    example: 'The ancient manor possessed a brooding, melancholy air that unsettled the servants.',
  },
  {
    word: 'Betwixt',
    category: 'Society & Demeanor',
    definition: 'Archaic form of between.',
    example: 'Standing betwixt honour and ruin, he hesitated at the threshold.',
  },
  {
    word: 'Gasometer',
    category: 'Places & Objects',
    definition: 'A large cylindrical reservoir for storing town coal gas.',
    example: 'The silhouette of the great gasometer loomed dark against the soot-streaked sky.',
  },
  {
    word: 'Chuckaboo',
    category: 'Victorian Slang & Wit',
    definition: 'A slang term of endearment for a close friend or chum.',
    example: '"Cheer up, chuckaboo! We shall crack this cipher before dawn."',
  },
  {
    word: 'Sepulchral',
    category: 'Atmosphere',
    definition: 'Relating to a tomb or interment; gloomy, hollow, and ominous.',
    example: 'A sepulchral toll emanated from the bell tower across the churchyard.',
  },
  {
    word: 'Insolence',
    category: 'Society & Demeanor',
    definition: 'Rude and disrespectful behavior; impudence.',
    example: 'Lord Harrington would brook no insolence from an upstart clerk.',
  },
  {
    word: 'Morass',
    category: 'Atmosphere',
    definition: 'An area of muddy, boggy ground; a complicated, confusing situation.',
    example: 'The carriage wheels sank deep into the treacherous morass of Dartmoor.',
  },
  {
    word: 'Cryptogram',
    category: 'Mystery & Danger',
    definition: 'A piece of secret writing in cipher or code.',
    example: 'Penned upon the margins of the will was a cryptographic riddle in Greek numerals.',
  },
  {
    word: 'Porphyry',
    category: 'Places & Objects',
    definition: 'A hard purple-and-white stone prized in classical architecture and statuary.',
    example: 'The mantlepiece was carved from Italian porphyry of the deepest claret tone.',
  },
];

export const VICTORIAN_STORY_PROMPTS = [
  {
    title: 'The Clockmaker of Fleet Street',
    hook: 'A master horologist receives a commission to build a mechanical automaton that sings in the voice of a young woman declared dead three years prior.',
    firstLine: 'The pocket watch on my workbench did not tick; it whispered.',
    genre: 'Clockwork Mystery',
  },
  {
    title: 'The Phantom of the London Underground',
    hook: 'During excavation of the Metropolitan Railway in 1863, navvies unearth a sealed brick vault beneath an ancient churchyard that was never meant to be opened.',
    firstLine: 'Thirty feet beneath the rumbling cobblestones of Farringdon, the spade struck hollow brass.',
    genre: 'Gothic Underground',
  },
  {
    title: 'The Lady in the Mourning Veil',
    hook: 'A wealthy widow visits a discreet private inquiry agent, claiming her late husband’s portrait in the long gallery changes expression each evening at dusk.',
    firstLine: 'She took her seat without lifting her black crape veil, though two pale fingers trembled upon her velvet parasol.',
    genre: 'Gaslamp Noir',
  },
  {
    title: 'The Alchemical Society of St. Jude',
    hook: 'A curious advertisement in the Times personal column leads an impoverished scholar to an opulent townhouse where members drink tea infused with mercurial draughts.',
    firstLine: 'Wanted: A gentleman of scholarly temperament, unimpeachable discretion, and no living relatives to inquire into his disappearance.',
    genre: 'Occult Victorian',
  },
  {
    title: 'The Midnight Post from Dover',
    hook: 'The royal mail coach arrives at Charing Cross with all six horses lathered in frost and the driver stone dead, clutching a dispatch destined for the Prime Minister.',
    firstLine: 'When the coachman failed to respond to the hostler’s whistle, we climbed to the box and found frost crusted upon his wide-open eyes.',
    genre: 'Penny Dreadful Intrigue',
  },
];

export const VICTORIAN_ORNAMENTS = ['❧', '❦', '❖', '🙠', '🙡', '✦', '✧', '§', '¶', '✤'];
