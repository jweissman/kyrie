import re,sys,glob,collections
roots=sys.argv[1:]
files=[f for r in roots for f in glob.glob(r+'/**/*.kyr',recursive=True)]
tot=0;latch=0;ex=collections.Counter();per=collections.Counter()
for f in files:
    s=open(f).read()
    for m in re.finditer(r'^\s*Rule (\w+)(.*?)\{(.*?)\}',s,re.S|re.M):
        tot+=1
        guard,body=m.group(2),m.group(3)
        negs=set(re.findall(r'not (\w+\([^)]*\))',guard))
        asserts=set(re.findall(r'Assert (\w+\([^)]*\))',body))
        if negs & asserts:
            latch+=1; per[f]+=1
print('rules',tot,'self-latching',latch)
for f,c in per.most_common(12): print(c,f)
