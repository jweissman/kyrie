import os,re,sys,collections,json
root=sys.argv[1]
files=[]
for d in ('src','web'):
  for dp,_,fs in os.walk(os.path.join(root,d)):
    for f in fs:
      if f.endswith(('.ts','.tsx')) and not f.endswith('.d.ts'): files.append(os.path.relpath(os.path.join(dp,f),root))
imp=re.compile(r"""^\s*import\s+(type\s+)?[^'"]*?from\s+['"](\.[^'"]+)['"]""",re.M)
imp2=re.compile(r"""^\s*import\s+['"](\.[^'"]+)['"]""",re.M)
def res(src,spec):
  base=os.path.normpath(os.path.join(os.path.dirname(src),spec))
  for c in (base+'.ts',base+'.tsx',base+'/index.ts',base):
    if os.path.isfile(os.path.join(root,c)): return c
  return None
edges=collections.defaultdict(set); tedges=collections.defaultdict(set)
for f in files:
  s=open(os.path.join(root,f)).read()
  for m in imp.finditer(s):
    t=res(f,m.group(2))
    if t and t.endswith(('.ts','.tsx')):
      (tedges if m.group(1) else edges)[f].add(t)
def layer(p):
  parts=p.split('/')
  if parts[0]=='web': return 'web/'+parts[1]
  if len(parts)==2: return 'src/core'
  return 'src/'+parts[1]
lay=collections.Counter()
for a,bs in edges.items():
  for b in bs:
    la,lb=layer(a),layer(b)
    if la!=lb: lay[(la,lb)]+=1
json.dump({'edges':{k:sorted(v) for k,v in edges.items()}},open(sys.argv[2],'w'))
for (a,b),n in sorted(lay.items()): print(f"{a} -> {b}: {n}")
# cycles via Tarjan on value edges
idx={};low={};st=[];on=set();sccs=[];i=[0]
sys.setrecursionlimit(100000)
def sc(v):
  idx[v]=low[v]=i[0];i[0]+=1;st.append(v);on.add(v)
  for w in edges.get(v,()):
    if w not in idx: sc(w);low[v]=min(low[v],low[w])
    elif w in on: low[v]=min(low[v],idx[w])
  if low[v]==idx[v]:
    c=[]
    while True:
      w=st.pop();on.discard(w);c.append(w)
      if w==v: break
    if len(c)>1: sccs.append(c)
for v in list(files):
  if v not in idx: sc(v)
print('SCCS',len(sccs))
for c in sorted(sccs,key=len,reverse=True): print(len(c), sorted(c)[:40])
