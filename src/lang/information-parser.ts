import type * as ohm from 'ohm-js';

type Node = ohm.Node;
type Field = { field: string; value: unknown };
// What a module says can be learned (Discovery), read from its declarations: a discovery told plainly, who knows it
// already, who is denied it, and who speaks a source (the discoveries with parts and their sources are read by
// ModuleParser, whose grammar actions take more parts than a parser's other methods may).
export class InformationParser {
  static readonly actions = {
    Information_plain: InformationParser.InformationPlain, KnownBy: InformationParser.KnownBy,
    DeniedBy: InformationParser.DeniedBy, Speakers: InformationParser.Speakers,
  };
  static InformationPlain(_discovery: Node, id: Node, text: Node, _dot: Node): Field {
    return { field: 'information', value: { id: id.sourceString, text: InformationParser.ast(text) as string, sources: [] } };
  }
  static KnownBy(_known: Node, _by: Node, actors: Node, _dot: Node): Field {
    return { field: 'knownBy', value: actors.asIteration().children.map(InformationParser.text) };
  }
  static DeniedBy(_denied: Node, _by: Node, actors: Node, _dot: Node): Field {
    return { field: 'deniedBy', value: actors.asIteration().children.map(InformationParser.text) };
  }
  static Speakers(_spoken: Node, _by: Node, actors: Node): string[] {
    return actors.asIteration().children.map(InformationParser.text);
  }
  private static ast(node: Node): unknown { return (node as ohm.Node & { ast(): unknown }).ast(); }
  private static text(this: void, node: Node): string { return node.sourceString; }
}
