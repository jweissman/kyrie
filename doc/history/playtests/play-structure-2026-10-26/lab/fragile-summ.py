# Summarise fragile-start audit runs: python3 fragile-summ.py <dir-of-json-or-combined-json>
import json,glob,sys,os,collections
src=sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(__file__),'data','fragile.json')
rows=json.load(open(src)) if src.endswith('.json') else [json.loads(open(f).read()) for f in glob.glob(os.path.join(src,'*.json')) if os.path.getsize(f)>0]
def key(r): return (r['mode'], r['cls']+('+hire' if r['hire'] else ''))
groups=collections.defaultdict(list)
for r in rows: groups[key(r)].append(r)
def pct(xs): return f"{100*sum(xs)/len(xs):.0f}%" if xs else '-'
print(f"{'mode':5} {'company':13} {'n':>3} {'reached':>7} {'fell':>5} {'died w/o a turn':>15} {'died before 1st turn':>20} {'fights':>6} {'set upon':>8} {'no-turn fights':>14} {'traps':>5} {'climax slight':>13}")
for k in sorted(groups):
    g=groups[k]; reached=[r for r in g if r.get('reached')]
    fights=sum(r.get('fights',0) for r in g); unch=sum(r.get('unchosenFights',0) for r in g); auto=sum(r.get('autoResolved',0) for r in g)
    cl=[r for r in reached if r.get('climaxLabelOnArrival') not in (None,'?','none')]
    print(f"{k[0]:5} {k[1]:13} {len(g):>3} {pct([bool(r.get('reached')) for r in g]):>7} {pct([bool(r.get('fell')) for r in reached]):>5} {pct([bool(r.get('diedWithoutTurn')) for r in reached]):>15} {pct([bool(r.get('diedBeforeFirstTurn')) for r in reached]):>20} {fights:>6} {unch:>8} {auto:>14} {sum(r.get('traps',0) for r in g):>5} {pct([r['climaxLabelOnArrival']=='slight' for r in cl]):>13}")
print()
print('climax labels on arrival by company (first ruin + big):')
for k in sorted(groups):
    c=collections.Counter(r.get('climaxLabelOnArrival') for r in groups[k] if r.get('reached'))
    print(' ',k, dict(c))
print('killed by:', collections.Counter((key(r)[1], r.get('killedBy')) for r in rows if r.get('killedBy')))
print('first-ruin targets with no hostile band:', sum(1 for r in rows if r.get('reached') and r.get('climax') is None), 'of', sum(1 for r in rows if r.get('reached')))
print('not reached reasons (no known ruin):', sum(1 for r in rows if r.get('target') is None))
