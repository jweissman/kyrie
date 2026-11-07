import { KP } from './kp';

// ── Act III, by route. Each starts at the Concourse on the morning the Edict is posted and ends with Act III done. ──
export type Route = 'grave' | 'seat' | 'door' | 'pebble' | 'chain' | 'shamed' | 'sea' | 'staged' | 'exile' | 'river';
export const toConcourse = (k: KP) => k.play('Wait › A while', "To the Rotunda's stage", "To the Rotunda's front of house", 'Out to Playhouse Row', 'To the Concourse of the Seven');
const toBells = (k: KP) => k.play('To the steps of the Tower of Bells', 'Into the Tower of Bells');
const bellsToField = (k: KP) => k.play('Out to the steps of the Tower of Bells', 'To the Gate of Dust', 'To the Field of Exposure');
const toCourt = (k: KP) => k.play('To the steps of the Tower of Law', "To the King's Court");
const warden = "Show the Warden the Edict's own words";
export async function actIII(k: KP, route: Route) {
  switch (route) {
    case 'grave': case 'seat': await k.play('=+144', '=+144', '=+144'); break;
    case 'door':
      await toCourt(k); await k.play(warden, '=+144', '=+144', '=+144'); break;
    case 'pebble':
      await toBells(k); await k.play('Speak to the acolyte of the Bells, who is on her knees', 'Help you, if I can');
      await bellsToField(k); await k.play('=+144', '=23:20');
      k.pass(); await k.play('Take a spade and help Ysolt Marrick lift the turf'); k.unforce(); break;
    case 'chain':
      await k.play('To the steps of the Tower of Bells', 'Into the Tower of Bells', "To the ringers' loft");
      await k.play('Ask Brother Ambros what the bells say of the Edict', 'The ones who weep. They are the only ones the dead have');
      await k.play('To the nave of the Bells', 'Out to the steps of the Tower of Bells', 'To the Gate of Dust');
      await k.play('Speak to Lucan Verrall at the Dust Gate', "Go to your father yourself. Tell him what he's done");
      await k.play('To the steps of the Tower of Bells', 'To the Concourse of the Seven'); await toCourt(k);
      await k.play(warden, '=+144', '=21:30');
      await k.play('To the steps of the Tower of Law', 'To the Concourse of the Seven', 'To the steps of the Tower of Bells', 'To the Gate of Dust');
      k.pass(); await k.play('Tell the Warden what the blind man said, and what his son said, at the Dust Gate'); k.unforce(); break;
    case 'shamed':
      await k.play('To the steps of the Tower of Law', "To the King's Court", "Into the King's Tower");
      k.pass(); await k.play("Ask the King for the Marshal's burial, in his own audience"); k.unforce(); break;
    case 'sea':
      await k.play('To the steps of the Tower of Bells', 'To the Gate of Dust', 'To the Field of Exposure', '=+144', '=23:20');
      k.pass(); await k.play("Take the body from the Field in the Salt-Wives' handcart under the cloth, to the river"); k.unforce(); break;
    case 'staged':
      await k.play('To Playhouse Row', 'Into the Wick', "To the Wick's wardrobe", 'Ask Clemency Orde what she is writing', "Whoever the city decides. You write what happens; don't make it happen");
      await k.play("To the Wick's dark stage", 'Out to Playhouse Row', 'To the Concourse of the Seven', 'To the steps of the Tower of Bells', 'To the Gate of Dust', 'To the Field of Exposure', '=19:30');
      k.pass(); await k.play("Play the Marshal's tragedy at the Field of Exposure, over the body, and name him"); k.unforce(); break;
    case 'exile':
      await k.play('To the steps of the Tower of Bells', 'To the Gate of Dust', 'Speak to Lucan Verrall at the Dust Gate', 'No. Look the other way. Nobody will thank you for the other thing');
      await k.play('To the steps of the Tower of Bells', 'Into the Tower of Bells', 'Speak to the acolyte of the Bells, who is on her knees', 'Watch. It is yours to do');
      await k.play('Out to the steps of the Tower of Bells', 'To the Concourse of the Seven', 'To the River Gate');
      k.pass(); await k.play('Get Ysolt and Lucan out of the city by the River Gate before the Field is closed'); k.unforce(); break;
    case 'river':
      await toBells(k); await k.play('Speak to the acolyte of the Bells, who is on her knees', "Stop you. I don't think you've counted the cost");
      k.pass(); await k.play('Keep Ysolt from the Field, by whatever can be said to her face'); k.unforce();
      await k.play('=+144', '=+144', '=+144', '=+30'); break;
  }
}
