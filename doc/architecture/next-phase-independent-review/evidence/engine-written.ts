// Review probe: relations the engine writes but EngineWrites does not list are treated as world constants by lint.
import { KyrLint } from '../../../../src/cli/kyr-lint';
const probe = 'doc/architecture/next-phase-independent-review/evidence/probes/engine-written/probe.campaign.json';
const findings = await KyrLint.campaign(probe);
console.log(JSON.stringify(findings.map(f => ({ check: f.check, severity: f.severity, message: f.message })), null, 1));
