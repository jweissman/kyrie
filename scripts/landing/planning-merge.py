#!/usr/bin/env python3
# Resolve a conflict in doc/architecture/mission-22/planning.json: the slice's members and its outside, and the active
# queue's lists, as a union of both sides (ours first); other keys from ours.
import json,subprocess
f='doc/architecture/mission-22/planning.json'
show=lambda s: json.loads(subprocess.check_output(['git','show',f':{s}:{f}']))
o,t=show(2),show(3)
def merge(a,b):
    for k,v in b.items():
        if k not in a: a[k]=v
        elif isinstance(a[k],list) and isinstance(v,list): a[k]+= [x for x in v if x not in a[k]]
        elif isinstance(a[k],dict) and isinstance(v,dict): merge(a[k],v)
merge(o,t)
sl=o.get('slice',{}); out=set(sl.get('outside',{}))
if 'members' in sl: sl['members']=[m for m in sl['members'] if m not in out]
open(f,'w').write(json.dumps(o,indent=1,ensure_ascii=False)+"\n"); subprocess.run(['git','add',f])
