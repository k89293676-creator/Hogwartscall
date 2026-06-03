export interface Spell {
  name: string;
  gesture: string;
  color: string;
  description: string;
  soundFile: string;
}

export const SPELLS: Spell[] = [
  { name: 'Lumos', gesture: 'lumos', color: '#FFD700', description: 'Open palm', soundFile: '/sounds/lumos.mp3' },
  { name: 'Incendio', gesture: 'incendio', color: '#FF4500', description: 'Make a fist', soundFile: '/sounds/incendio.mp3' },
  { name: 'Expelliarmus', gesture: 'expelliarmus', color: '#4169E1', description: 'Point index finger', soundFile: '/sounds/expelliarmus.mp3' },
  { name: 'Wingardium Leviosa', gesture: 'wingardium', color: '#32CD32', description: 'L-shape (thumb+index)', soundFile: '/sounds/wingardium.mp3' },
];
