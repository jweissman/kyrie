// A command refused because it would take the company into another hex of the country otherwise than by a journey set
// out on (TR-20): what was asked, where the company stands, and where it would have come to. Typed, so that a host
// or a driver can tell it from a command that failed, and say it as the refusal it is.
export class CrossingRefused extends Error {
  readonly kind = 'crossing';
  constructor(readonly action: string, readonly from: string, readonly to: string) {
    super(`Crossing into another hex is a journey set out on from the map: ${action}`);
    this.name = 'CrossingRefused';
  }
}
