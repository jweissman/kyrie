import type { Campaign, CampaignEvent } from '../campaign/campaign';

// Whether the one who plays acted in a fight: took a turn, not only lost one. A fight is told by how it ended only
// where they did, having seen it blow by blow (see Narrator.tidy; cold play 6, CL-51: paralysed by the first blow of
// the keeper of the vault, Wenna never moved, and was told only the last of four rounds).
export class FightSeen {
  static acted(campaign: Campaign, event: CampaignEvent): boolean {
    const me = campaign.readout.partyIds[0], passive = ['skip', 'save', 'death'];
    return event.combat.some(e => 'actor' in e && e.actor === me && !passive.includes(e.type));
  }
}
