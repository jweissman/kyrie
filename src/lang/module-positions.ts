import type { Call, Module } from './module';
import type { SiteSpan } from './declaration-sites';
import { SymbolReferences } from './symbol-references';

export class ModulePositions {
  private readonly calls = new WeakMap<Call, { name?: SiteSpan; args: Record<number, SiteSpan> }>();
  constructor(private readonly module: Module) {
    if (!module.sites?.references) { return; }
    SymbolReferences.of(module).forEach((ref, index) => {
      const span = module.sites?.references?.[index];
      if (!ref.call || !span) { return; }
      const positions = this.calls.get(ref.call) ?? { args: {} };
      if (ref.argIndex === undefined) { positions.name = span; } else { positions.args[ref.argIndex] = span; }
      this.calls.set(ref.call, positions);
    });
  }

  type(index: number, argument: number): SiteSpan | undefined {
    return this.module.sites?.signatureTypes?.find(s => s.index === index)?.spans[argument];
  }
  call(call: Call, argument?: number): SiteSpan | undefined {
    const found = this.calls.get(call);
    return argument === undefined ? found?.name : found?.args[argument];
  }
  static message(span: SiteSpan | undefined, message: string): string {
    return span?.line !== undefined && span.column !== undefined
      ? `Line ${span.line}, col ${span.column}: ${message}` : message;
  }
}
