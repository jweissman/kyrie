// A brace written as a brace in a Kyr string (\{), which names nothing: kept apart from the braces that name
// entities and measures until the text is told (see StatementParser.unquote, ObservationText.render).
export class KyrText {
  static readonly brace = ['\uE000', '\uE001'] as const;
}
