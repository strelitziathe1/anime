/**
 * Character Database
 * Top anime characters + League of Legends champions with themes and wallpapers
 */

export interface CharacterTheme {
  id: string;
  name: string;
  source: string;
  description: string;
  archetype: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  wallpapers: string[];
  tags: string[];
}

export const characters: CharacterTheme[] = [
  // Top Anime Characters
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    source: 'One Piece',
    description: 'The main protagonist who dreams of becoming the Pirate King',
    archetype: 'Hero/Captain',
    colors: {
      primary: '#ff4444',
      secondary: '#ffaa00',
      accent: '#ffdd00',
      background: '#fff8dc',
      text: '#1a1a1a',
    },
    wallpapers: ['/wallpapers/default/luffy-pirate.jpg'],
    tags: ['pirate', 'hero', 'determination', 'friendship'],
  },
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    source: 'Naruto',
    description: 'A ninja with a dream to become Hokage',
    archetype: 'Hero/Shinobi',
    colors: {
      primary: '#ff6b35',
      secondary: '#f7931e',
      accent: '#fdb833',
      background: '#fef5e7',
      text: '#1a1a1a',
    },
    wallpapers: ['/wallpapers/default/naruto-ninja.jpg'],
    tags: ['ninja', 'hero', 'determination', 'power'],
  },
  {
    id: 'ichigo',
    name: 'Ichigo Kurosaki',
    source: 'Bleach',
    description: 'A Soul Reaper who protects the living world from evil spirits',
    archetype: 'Hero/Warrior',
    colors: {
      primary: '#ff9900',
      secondary: '#333333',
      accent: '#ffffff',
      background: '#0a0a0a',
      text: '#ffffff',
    },
    wallpapers: ['/wallpapers/default/ichigo-reaper.jpg'],
    tags: ['soul reaper', 'warrior', 'protection', 'spirit'],
  },
  {
    id: 'light',
    name: 'Light Yagami',
    source: 'Death Note',
    description: 'A genius who becomes a self-appointed judge using a supernatural notebook',
    archetype: 'Antagonist/Anti-hero',
    colors: {
      primary: '#000000',
      secondary: '#ff0000',
      accent: '#ffffff',
      background: '#1a1a1a',
      text: '#ffffff',
    },
    wallpapers: ['/wallpapers/default/light-genius.jpg'],
    tags: ['genius', 'villain', 'power', 'justice'],
  },
  {
    id: 'tanjiro',
    name: 'Tanjiro Kamado',
    source: 'Demon Slayer',
    description: 'A kindhearted demon slayer on a quest to save his sister',
    archetype: 'Hero/Slayer',
    colors: {
      primary: '#d62828',
      secondary: '#f77f00',
      accent: '#fcbf49',
      background: '#eae2b7',
      text: '#003049',
    },
    wallpapers: ['/wallpapers/default/tanjiro-slayer.jpg'],
    tags: ['slayer', 'hero', 'determination', 'family'],
  },
  {
    id: 'lelouch',
    name: 'Lelouch vi Britannia',
    source: 'Code Geass',
    description: 'A strategist with supernatural power to command anyone',
    archetype: 'Antagonist/Genius',
    colors: {
      primary: '#8b00ff',
      secondary: '#ff0080',
      accent: '#00ffff',
      background: '#0a0a0a',
      text: '#ffffff',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-1.jpg',
    ],
    tags: ['strategist', 'genius', 'power', 'ambition'],
  },
  {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    source: 'Naruto',
    description: 'A talented shinobi seeking revenge and power',
    archetype: 'Anti-hero/Warrior',
    colors: {
      primary: '#2d3436',
      secondary: '#636e72',
      accent: '#0084ff',
      background: '#1a1a1a',
      text: '#ffffff',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['warrior', 'revenge', 'power', 'dark'],
  },
  {
    id: 'aizen',
    name: 'Sosuke Aizen',
    source: 'Bleach',
    description: 'A powerful captain with a grand ambition',
    archetype: 'Villain/Genius',
    colors: {
      primary: '#4a4a4a',
      secondary: '#87ceeb',
      accent: '#ffd700',
      background: '#0a0a0a',
      text: '#ffffff',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-1.jpg',
    ],
    tags: ['captain', 'villain', 'genius', 'ambition'],
  },
  {
    id: 'saitama',
    name: 'Saitama',
    source: 'One Punch Man',
    description: 'An overpowered hero searching for worthy opponents',
    archetype: 'Hero/Warrior',
    colors: {
      primary: '#ffff00',
      secondary: '#ff8c00',
      accent: '#000000',
      background: '#ffffcc',
      text: '#000000',
    },
    wallpapers: ['/wallpapers/default/saitama-hero.jpg'],
    tags: ['hero', 'overpowered', 'warrior', 'bald'],
  },
  {
    id: 'deku',
    name: 'Izuku Midoriya',
    source: 'My Hero Academia',
    description: 'A determined hero-in-training with a powerful quirk',
    archetype: 'Hero/Student',
    colors: {
      primary: '#00a86b',
      secondary: '#228b22',
      accent: '#ffd700',
      background: '#f0fff0',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['hero', 'student', 'determination', 'quirk'],
  },
  {
    id: 'levi',
    name: 'Levi Ackermann',
    source: 'Attack on Titan',
    description: 'An elite soldier with extraordinary combat skills',
    archetype: 'Soldier/Commander',
    colors: {
      primary: '#2c3e50',
      secondary: '#34495e',
      accent: '#c0392b',
      background: '#ecf0f1',
      text: '#2c3e50',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['soldier', 'commander', 'skilled', 'serious'],
  },
  {
    id: 'goku',
    name: 'Goku (Son Goku)',
    source: 'Dragon Ball',
    description: 'A legendary warrior with endless power-up potential',
    archetype: 'Hero/Warrior',
    colors: {
      primary: '#ff6b00',
      secondary: '#0066ff',
      accent: '#ffd700',
      background: '#fff5e1',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['warrior', 'legend', 'power', 'martial arts'],
  },
  {
    id: 'vegeta',
    name: 'Vegeta',
    source: 'Dragon Ball',
    description: 'The Saiyan prince with pride and strength',
    archetype: 'Anti-hero/Warrior',
    colors: {
      primary: '#0066ff',
      secondary: '#ffff00',
      accent: '#ff6600',
      background: '#f0f8ff',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['prince', 'saiyan', 'pride', 'warrior'],
  },
  {
    id: 'erwin',
    name: 'Erwin Smith',
    source: 'Attack on Titan',
    description: 'A strategic commander of the Survey Corps',
    archetype: 'Commander/Strategist',
    colors: {
      primary: '#8b0000',
      secondary: '#4a4a4a',
      accent: '#daa520',
      background: '#fffacd',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['commander', 'strategist', 'leader', 'military'],
  },
  {
    id: 'rem',
    name: 'Rem',
    source: 'Re:Zero',
    description: 'A demon maid with blue hair and unconditional love',
    archetype: 'Supporter/Maid',
    colors: {
      primary: '#0099ff',
      secondary: '#33ccff',
      accent: '#ffffff',
      background: '#e6f2ff',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['maid', 'demon', 'loyal', 'blue'],
  },
  {
    id: 'mikasa',
    name: 'Mikasa Ackermann',
    source: 'Attack on Titan',
    description: 'A skilled soldier devoted to protecting those she cares for',
    archetype: 'Soldier/Warrior',
    colors: {
      primary: '#1a1a1a',
      secondary: '#8b0000',
      accent: '#696969',
      background: '#f5f5f5',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['soldier', 'warrior', 'devoted', 'strong'],
  },
  {
    id: 'yuno',
    name: 'Yuno Gasai',
    source: 'Future Diary',
    description: 'An obsessive girl with unstable but powerful determination',
    archetype: 'Yandere/Anti-hero',
    colors: {
      primary: '#ff1493',
      secondary: '#ff69b4',
      accent: '#000000',
      background: '#fff0f5',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['yandere', 'obsessive', 'pink', 'determined'],
  },
  {
    id: 'kurisu',
    name: 'Kurisu Makise',
    source: 'Steins;Gate',
    description: 'A brilliant scientist helping prevent catastrophe',
    archetype: 'Scientist/Supporter',
    colors: {
      primary: '#ff0000',
      secondary: '#ffffff',
      accent: '#ffff00',
      background: '#ffe4e1',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['scientist', 'brilliant', 'helper', 'time'],
  },
  {
    id: 'subaru',
    name: 'Subaru Natsuki',
    source: 'Re:Zero',
    description: 'An ordinary man with the power to turn back time',
    archetype: 'Hero/Time Traveler',
    colors: {
      primary: '#4169e1',
      secondary: '#1e90ff',
      accent: '#00bfff',
      background: '#f0f8ff',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['time traveler', 'hero', 'determination', 'blue'],
  },
  {
    id: 'asuna',
    name: 'Asuna Yuuki',
    source: 'Sword Art Online',
    description: 'A skilled swordswoman in a virtual reality world',
    archetype: 'Warrior/Swordswoman',
    colors: {
      primary: '#ff69b4',
      secondary: '#ffb6c1',
      accent: '#ffd700',
      background: '#fff0f5',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['swordswoman', 'warrior', 'vr', 'pink'],
  },
  {
    id: 'kirito',
    name: 'Kazuto Kirigaya (Kirito)',
    source: 'Sword Art Online',
    description: 'A legendary player in a deadly virtual reality game',
    archetype: 'Hero/Gamer',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#ff4444',
      background: '#f5f5f5',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['gamer', 'hero', 'black', 'sword'],
  },
  {
    id: 'haruhi',
    name: 'Haruhi Suzumiya',
    source: 'The Melancholy of Haruhi Suzumiya',
    description: 'A high school girl who unknowingly shapes reality',
    archetype: 'Protagonist/Reality Warper',
    colors: {
      primary: '#ff8800',
      secondary: '#ffaa00',
      accent: '#ffffff',
      background: '#ffffcc',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['reality warper', 'protagonist', 'school', 'chaos'],
  },
  {
    id: 'lancer',
    name: 'Lancer',
    source: 'Fate Series',
    description: 'A legendary hero servant with deadly spear techniques',
    archetype: 'Servant/Warrior',
    colors: {
      primary: '#ff0000',
      secondary: '#ffff00',
      accent: '#000000',
      background: '#fff0f0',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['servant', 'hero', 'spear', 'fate'],
  },
  {
    id: 'emilia',
    name: 'Emilia',
    source: 'Re:Zero',
    description: 'A half-elf with a kind heart seeking to become ruler',
    archetype: 'Candidate/Mage',
    colors: {
      primary: '#9370db',
      secondary: '#dda0dd',
      accent: '#ffffff',
      background: '#f8f0ff',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['elf', 'candidate', 'mage', 'kind'],
  },
  {
    id: 'puck',
    name: 'Puck',
    source: 'Re:Zero',
    description: 'A small but powerful spirit with mysterious origins',
    archetype: 'Spirit/Guardian',
    colors: {
      primary: '#ffb6c1',
      secondary: '#ffc0cb',
      accent: '#ffffff',
      background: '#fff0f5',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['spirit', 'guardian', 'small', 'powerful'],
  },
  {
    id: 'beatrice',
    name: 'Beatrice',
    source: 'Re:Zero',
    description: 'A spirit maid with aristocratic manners and loyalty',
    archetype: 'Spirit/Maid',
    colors: {
      primary: '#8b4513',
      secondary: '#d2691e',
      accent: '#ffd700',
      background: '#fff8dc',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['spirit', 'maid', 'aristocratic', 'loyal'],
  },

  // League of Legends Champions
  {
    id: 'leblanc_lol',
    name: 'Le Blanc',
    source: 'League of Legends',
    description:
      'The Deceiver - A deceptive mage who manipulates reality and creates illusions. She is mysterious and powerful, serving dark purposes with elegance.',
    archetype: 'Mage/Deceiver',
    colors: {
      primary: '#e0d5f5',
      secondary: '#b59bd6',
      accent: '#8b7ba8',
      background: '#2a2640',
      text: '#e0d5f5',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-1.jpg',
    ],
    tags: ['mage', 'deceiver', 'illusion', 'mysterious', 'lol'],
  },
  {
    id: 'belveth_lol',
    name: "Bel'Veth",
    source: 'League of Legends',
    description:
      "The Empress of the Void - A terrifying void creature seeking to reshape reality. She embodies chaos and consumption, displaying otherworldly power and ambition.",
    archetype: 'Void Creature/Empress',
    colors: {
      primary: '#8b00ff',
      secondary: '#5500aa',
      accent: '#00ffff',
      background: '#1a0033',
      text: '#00ffff',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['void', 'empress', 'chaos', 'otherworldly', 'lol'],
  },
  {
    id: 'renata_lol',
    name: 'Renata Glasc',
    source: 'League of Legends',
    description:
      'The Chemtech Baroness - A brilliant chemist and entrepreneur with augmented strength. She manipulates through chemistry and wit, always one step ahead.',
    archetype: 'Chemtech/Strategist',
    colors: {
      primary: '#00ff88',
      secondary: '#00cc66',
      accent: '#ff00ff',
      background: '#001a00',
      text: '#00ff88',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['chemtech', 'baroness', 'strategist', 'entrepreneur', 'lol'],
  },
  {
    id: 'ahri',
    name: 'Ahri',
    source: 'League of Legends',
    description: 'The Nine-Tailed Fox - A magical fox with charm and power, seeking connection and purpose.',
    archetype: 'Mage/Charm',
    colors: {
      primary: '#ff69b4',
      secondary: '#ff1493',
      accent: '#ffff00',
      background: '#fff0f5',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['fox', 'mage', 'charm', 'lol'],
  },
  {
    id: 'jinx',
    name: 'Jinx',
    source: 'League of Legends',
    description: 'The Loose Cannon - A chaotic and unpredictable powder monkey with explosive power.',
    archetype: 'Marksman/Chaos',
    colors: {
      primary: '#ff00ff',
      secondary: '#00ffff',
      accent: '#ffff00',
      background: '#1a0033',
      text: '#ff00ff',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['loose cannon', 'powder monkey', 'chaotic', 'lol'],
  },
  {
    id: 'garen',
    name: 'Garen',
    source: 'League of Legends',
    description:
      'The Might of Demacia - A powerful warrior of Demacia, strong and noble, wielding a massive sword.',
    archetype: 'Warrior/Juggernaut',
    colors: {
      primary: '#1a5f7a',
      secondary: '#2d9cdb',
      accent: '#ffd700',
      background: '#e6f2ff',
      text: '#1a1a1a',
    },
    wallpapers: [
      '/wallpapers/default/wallpaper-2.jpg',
    ],
    tags: ['warrior', 'demacia', 'sword', 'noble', 'lol'],
  },
];

export const getCharacterById = (id: string): CharacterTheme | undefined => {
  return characters.find((c) => c.id === id);
};

export const searchCharacters = (query: string): CharacterTheme[] => {
  const lower = query.toLowerCase();
  return characters.filter(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      c.source.toLowerCase().includes(lower) ||
      c.tags.some((t) => t.toLowerCase().includes(lower))
  );
};

export const filterBySource = (source: string): CharacterTheme[] => {
  return characters.filter((c) => c.source === source);
};

export const filterByArchetype = (archetype: string): CharacterTheme[] => {
  return characters.filter((c) => c.archetype === archetype);
};

export const getAllSources = (): string[] => {
  return Array.from(new Set(characters.map((c) => c.source)));
};

export const getAllArchetypes = (): string[] => {
  return Array.from(new Set(characters.map((c) => c.archetype)));
};

export const getAllTags = (): string[] => {
  const allTags = new Set<string>();
  characters.forEach((c) => {
    c.tags.forEach((tag) => allTags.add(tag));
  });
  return Array.from(allTags).sort();
};

export const filterByTag = (tag: string): CharacterTheme[] => {
  return characters.filter((c) => c.tags.includes(tag));
};

export const getRandomCharacter = (): CharacterTheme => {
  return characters[Math.floor(Math.random() * characters.length)];
};

export const getCharacterCount = (): number => {
  return characters.length;
};
