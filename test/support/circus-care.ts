import type { Journey } from '../../src/session/journey';

// OR-1396: the lone SRD bard cannot ignore the voyage's warning and the delta fever.
export async function shelteredLandfall(j: Journey, watches = 1600) {
  const arrival = j.watch() + watches;
  await j.play('==until circus__stormOn(circus__wapshotts)', 'Go below and wedge yourselves among the cages',
    `==${arrival}`, "To the Progress's landing");
}

export async function gatherKingsfoil(j: Journey) {
  await j.play("To the cycad forest's edge", '==11:30');
  j.roll('pass');
  await j.play('Follow the fern-runners when they go off together at noon');
  j.roll(undefined);
  await j.play('To the cycad aisle', 'To the sheltered hollow',
    'Gather a sprig of kingsfoil', 'Gather a second sprig of kingsfoil', 'Gather a third sprig of kingsfoil',
    'To the cycad aisle', "To the cycad forest's edge", "To the Progress's landing");
}

export async function tendFever(j: Journey) {
  if (j.holds('circus__fever', 'party')) { await j.play('Steep a sprig of kingsfoil and make the sick drink it'); }
}

export async function waitWithCare(j: Journey, watches: number) {
  const end = j.watch() + watches;
  await tendFever(j);
  for (let at = j.watch() + 72; at < end; at += 72) {
    await j.play(`==${at}`);
    await tendFever(j);
  }
  await j.play(`==${end}`);
  await tendFever(j);
}
