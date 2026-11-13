# Scratch: the transitive local imports (TS and JSON) of a module, by regex over import lines.
import re,os,sys
root=sys.argv[1]
def deps(p):
    try: s=open(p).read()
    except: return []
    out=[]
    for m in re.finditer(r"^(?:import|export)[^;]*?from '(\.[^']+)'",s,re.M):
        if re.match(r"^import type ",m.group(0)): continue
        q=os.path.normpath(os.path.join(os.path.dirname(p),m.group(1)))
        for c in (q, q+'.ts', q+'.tsx', q+'/index.ts'):
            if os.path.isfile(c): out.append(c); break
    return out
for start in sys.argv[2:]:
    seen=set(); stack=[start]
    while stack:
        p=stack.pop()
        if p in seen: continue
        seen.add(p); stack.extend(deps(p))
    ts=[x for x in seen if x.endswith(('.ts','.tsx'))]; js=[x for x in seen if x.endswith('.json')]
    kb=sum(os.path.getsize(x) for x in js)//1024
    lines=sum(len(open(x).read().split('\n')) for x in ts)
    print(f"{start}: {len(ts)} TS files ({lines} lines), {len(js)} JSON files ({kb} KB)")
