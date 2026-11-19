#!/usr/bin/env python3
# Resolve conflicted register and features rows by id: each row from the side that changed it from the merge base
# (both changed: the commit being applied), rows only one side has kept. Usage: resolve-rows.py <file>...
import re,sys,subprocess
# Each conflicted row by its id: the side that changed it from the merge base (both changed: the commit being applied),
# rows only one side has kept; order: HEAD's, then the others'.
def key(line):
    m=re.match(r'\s*\|\s*([A-Z]+-\d+)\s*\|',line) or re.match(r'\s*"([A-Z]+-\d+)"\s*:',line)
    return m.group(1) if m else line
for p in sys.argv[1:]:
    try: base=subprocess.run(['git','show',f':1:{p}'],capture_output=True,text=True).stdout
    except Exception: base=''
    bk={key(l):l for l in base.split('\n') if l}
    def res(m):
        head=[l for l in m.group(1).split('\n') if l]; theirs=[l for l in m.group(2).split('\n') if l]
        tk={key(l):l for l in theirs}; out=[]
        for l in head:
            k=key(l); t=tk.get(k)
            out.append(t if t is not None and t!=bk.get(k) else l)
        hk={key(l) for l in head}
        out+= [l for l in theirs if key(l) not in hk]
        return '\n'.join(out)+'\n'
    s=open(p).read()
    s=re.sub(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n',res,s,flags=re.S)
    open(p,'w').write(s)
