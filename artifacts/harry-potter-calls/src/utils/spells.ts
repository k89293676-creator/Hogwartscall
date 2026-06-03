// BUG 19 NOTE: soundFile paths are kept for API compatibility but are NOT used at runtime.
// useSpells.ts synthesizes all sounds via the Web Audio API.
export interface Spell {
  name: string;
  gesture: string;
  color: string;
  glowColor: string;
  description: string;
  soundFile: string;
  icon: string;
  house: string;
}

export const SPELLS: Spell[] = [
  {
    name: 'Lumos',
    gesture: 'lumos',
    color: '#FFD700',
    glowColor: 'rgba(255,215,0,0.5)',
    description: 'Open palm',
    soundFile: '',
    icon: '☀',
    house: 'hufflepuff',
  },
  {
    name: 'Incendio',
    gesture: 'incendio',
    color: '#FF4500',
    glowColor: 'rgba(255,69,0,0.5)',
    description: 'Make a fist',
    soundFile: '',
    icon: '🔥',
    house: 'gryffindor',
  },
  {
    name: 'Expelliarmus',
    gesture: 'expelliarmus',
    color: '#DC143C',
    glowColor: 'rgba(220,20,60,0.5)',
    description: 'Point index finger',
    soundFile: '',
    icon: '⚡',
    house: 'gryffindor',
  },
  {
    name: 'Wingardium Leviosa',
    gesture: 'wingardium',
    color: '#32CD32',
    glowColor: 'rgba(50,205,50,0.5)',
    description: 'L-shape (thumb+index)',
    soundFile: '',
    icon: '✦',
    house: 'ravenclaw',
  },
  {
    name: 'Patronus',
    gesture: 'patronus',
    color: '#A8D8F0',
    glowColor: 'rgba(168,216,240,0.6)',
    description: 'Peace sign (index+middle)',
    soundFile: '',
    icon: '✦',
    house: 'gryffindor',
  },
  {
    name: 'Accio',
    gesture: 'accio',
    color: '#9B59B6',
    glowColor: 'rgba(155,89,182,0.5)',
    description: 'Pinky out (shaka sign)',
    soundFile: '',
    icon: '◈',
    house: 'ravenclaw',
  },
  {
    name: 'Stupefy',
    gesture: 'stupefy',
    color: '#FF1493',
    glowColor: 'rgba(255,20,147,0.6)',
    description: 'Three fingers up',
    soundFile: '',
    icon: '★',
    house: 'slytherin',
  },
  {
    name: 'Protego',
    gesture: 'protego',
    color: '#00BFFF',
    glowColor: 'rgba(0,191,255,0.5)',
    description: 'Rock sign (index+pinky)',
    soundFile: '',
    icon: '◉',
    house: 'ravenclaw',
  },
  {
    name: 'Nox',
    gesture: 'nox',
    color: '#6B7280',
    glowColor: 'rgba(107,114,128,0.6)',
    description: 'Pinch fingers',
    soundFile: '',
    icon: '🌑',
    house: 'slytherin',
  },
  {
    name: 'Alohomora',
    gesture: 'alohomora',
    color: '#F39C12',
    glowColor: 'rgba(243,156,18,0.5)',
    description: 'Spread fingers wide',
    soundFile: '',
    icon: '🗝',
    house: 'hufflepuff',
  },
  {
    name: 'Riddikulus',
    gesture: 'riddikulus',
    color: '#E91E63',
    glowColor: 'rgba(233,30,99,0.5)',
    description: 'Two-finger point',
    soundFile: '',
    icon: '🎊',
    house: 'gryffindor',
  },
  {
    name: 'Expecto Patronum',
    gesture: 'expecto',
    color: '#E8F4FD',
    glowColor: 'rgba(232,244,253,0.7)',
    description: 'Wrist cross',
    soundFile: '',
    icon: '🦌',
    house: 'ravenclaw',
  },
];
