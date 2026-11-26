import { Words } from './words';

// What a question led with is called on its row: a short title, whole within the row at a phone's width, its full
// words said when it is asked (the owner's playtest, 25 November: "important questions are long and so become
// elliptical with '...' at the end"). "Talk to Eogan — ask what is out in the country round" is "Eogan: what is out in
// the country round"; one that will not go into the room is its talk ("Talk to Eogan"), the question within it.
export class QuestionTitle {
  // The characters a row holds at 390 pixels, its mark and key beside it (as test/small/label-length counts them).
  static readonly room = 40;
  // Someone asked by what they are, not by the name the talk has for them ("Ask the drover's lad where his drove went",
  // in the talk to Oswy Tolley): the question is the matter, put to whom the talk names.
  private static readonly role =
    /^Ask (?:the|a|an) (?:[\w'’-]+ ){1,3}?(?=(?:who|what|where|when|why|how|whether|if|about) )/;
  // full: the words the row would have; talk: the talk it is led within ("Talk to Eogan"); question: what is asked
  // ("Ask Eogan what is out in the country round", or "Ask what…" as it stands under the talk).
  static of(full: string, talk: string | undefined, question: string): string {
    if (full.length <= this.room || !/^Ask /.test(question)) { return full; }
    const who = talk && /^Talk to (.+)$/.exec(talk)?.[1];
    if (!who) { return full; }
    const names = [who, Words.bare(who), `the ${Words.bare(who)}`];
    const named = names.find(n => question.startsWith(`Ask ${n} `));
    const matter = (named ? question.slice(`Ask ${named} `.length)
      : question.replace(QuestionTitle.role, '').replace(/^Ask /, '')).replace(/^about /, '');
    const title = `${Words.upper(who)}: ${matter}`;
    if (matter !== question && title.length <= this.room) { return title; }
    return talk.length <= this.room ? talk : Words.upper(who);
  }
}
