import json,glob,statistics as st,sys
rows=[]
import os
rows=json.load(open(os.path.join(os.path.dirname(__file__),'data','census.json')))
big=[];small=[];shop=[];richest=[];modcount={}
for d in rows:
    ss=d['sites']
    for s in ss:
        tot=s['coin']+s['treasure']
        (big if s['rooms']>=15 else small).append((tot,s['fightXp'],s['rooms'],s['coin']))
    shop.append(d['shopPrices']['sum'])
    richest.append(max(s['coin']+s['treasure'] for s in ss) if ss else 0)
    for m in d['modules']: modcount[m]=modcount.get(m,0)+1
def q(xs): xs=sorted(xs); return f"min {xs[0]} med {st.median(xs)} max {xs[-1]} (n={len(xs)})"
print('seeds',len(rows))
print('large ruins (>=15 rooms) loot coin+treasure:',q([b[0] for b in big]))
print('large ruins fight XP:',q([b[1] for b in big]))
print('large ruins floor coin:',q([b[3] for b in big]))
print('small sites loot:',q([b[0] for b in small]),' fightXp:',q([b[1] for b in small]))
print('whole-country shop catalogue value:',q(shop))
print('richest single site / shop catalogue ratio:',q([round(r/s,1) for r,s in zip(richest,shop)]))
print('large ruins per country:',q([sum(1 for s in d['sites'] if s['rooms']>=15) for d in rows]))
print('modules frequency:',sorted(modcount.items(),key=lambda x:-x[1]))
print('start coin', q([d['startCoin'] for d in rows]))
