import type { ChangeEvent, MouseEvent } from 'react';
import type { CompanyView, Member } from '../engine/protocol';
import type { ReaderApp } from './reader-app';

type Preview = CompanyView['members'][number];

// One companion, told in a sentence ("Elen, an elf ranger, once a hunter"), what their calling means in practice and
// what they bring; changed in place.
export class CompanionCard {
  static View({ app, index, member, preview }: { app: ReaderApp; index: number; member: Member; preview?: Preview }) {
    const catalog = app.state.catalog!, editing = app.state.editing === index;
    const ancestry = catalog.ancestries.find(a => a.id === member.raceId)?.name.toLowerCase() ?? member.raceId ?? '';
    const calling = catalog.callings.find(c => c.id === member.classId);
    const background = catalog.backgrounds.find(b => b.id === member.backgroundId);
    const brings = [preview?.skills.length ? `knows ${preview.skills.join(', ').toLowerCase()}` : '',
      preview?.gear.length ? `carries ${preview.gear.join(', ').toLowerCase()}` : ''].filter(Boolean).join('; ');
    return (
      <li className={`companion${editing ? ' editing' : ''}`} data-companion={index}>
        <p className="who">
          <b>{member.name || `Companion ${index + 1}`}</b>, {CompanionCard.a(ancestry)} {ancestry}{' '}
          {calling?.name.toLowerCase()}{member.level && member.level > 1 ? ` of level ${member.level}` : ''}
          {background ? `, once a ${background.name.toLowerCase()}` : ''}.{' '}
          <button type="button" className="change" data-index={index} aria-expanded={editing}
            onClick={CompanionCard.toggle.bind(null, app)}>{editing ? 'done' : 'change'}</button>
        </p>
        {preview && <p className="practice">{preview.practice}</p>}
        {brings && <p className="brings">{brings.charAt(0).toUpperCase() + brings.slice(1)}.</p>}
        {preview?.contact && <p className="brings">Has {preview.contact}.</p>}
        {preview?.requires && <p className="warn">{preview.requires}.</p>}
        {editing && CompanionCard.editor(app, index, member)}
      </li>
    );
  }
  private static a(word: string): string { return /^[aeiou]/i.test(word) ? 'an' : 'a'; }
  private static toggle(app: ReaderApp, e: MouseEvent<HTMLButtonElement>) {
    const index = Number(e.currentTarget.dataset.index);
    app.setState({ editing: app.state.editing === index ? -1 : index });
  }
  private static editor(app: ReaderApp, index: number, member: Member) {
    const catalog = app.state.catalog!, calling = catalog.callings.find(c => c.id === member.classId);
    const open = catalog.backgrounds.filter(b => b.id === member.backgroundId || !b.calling || b.calling === member.classId);
    const field = CompanionCard.change.bind(null, app, index);
    return (
      <div className="editor">
        <label>Name <input data-field="name" maxLength={40} value={member.name ?? ''} onChange={field} /></label>
        <label>Ancestry <select data-field="raceId" value={member.raceId ?? ''} onChange={field}>
          {catalog.ancestries.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
        <label>Calling <select data-field="classId" value={member.classId ?? ''} onChange={field}>
          {catalog.callings.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        {calling && calling.specializations.length > 0 && <label>Specialization
          <select data-field="specialization" value={member.traits?.[0] ?? ''} onChange={field}>
            <option value="">Drawn at random</option>
            {calling.specializations.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>}
        <label>Background <select data-field="backgroundId" value={member.backgroundId ?? ''} onChange={field}>
          <option value="">None</option>
          {catalog.kinds.filter(k => open.some(b => b.kind === k.id)).map(k => <optgroup key={k.id} label={k.name}>
            {open.filter(b => b.kind === k.id).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </optgroup>)}</select></label>
      </div>
    );
  }
  private static change(app: ReaderApp, index: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    app.opening.edit(index, e.target.dataset.field!, e.target.value);
  }
}
