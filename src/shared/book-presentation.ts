export interface BookPresentation {
  game: string;
  // The composition root supplies trusted, already-rendered markup.
  emblem(id: string, className?: string): string;
}
