import sys,json
# show.py <out.jsonl> [full]: the turns so far (a path, since a sandbox may refuse a redirect); stdin without one.
args=sys.argv[1:]
path=next((a for a in args if a.endswith(".jsonl")),None)
full="full" in args
for l in (open(path) if path else sys.stdin):
  try: d=json.loads(l)
  except Exception: print("RAW",l[:2000]); continue
  # The purse is said in the scene's own lines ("12 coin · 2 rations"); a runner that gives one apart is said so.
  print("== turn",d.get("turn"),d.get("moment"),"| at",d.get("at"),"|",d.get("you"),*(["| purse",d["purse"]] if d.get("purse") is not None else []))
  for x in d.get("scene",{}).get("lines",[]): print("  >",x)
  for k in d:
    # The runner's instruments (what an act changed, what still holds) are the measures', never the player's (CL-61).
    if k not in ("turn","moment","scene","offer","purse","you","aim","aims","at","changed","kept"): print("  ["+k+"]",json.dumps(d[k],ensure_ascii=False)[:1500])
  print("  aims:",[(a["id"],a["text"]) for a in d.get("aims",[])])
  o=d.get("offer",{})
  for a in o.get("primary",[]): print("  P",a["id"],"|",a["label"],a.get("aspects"),a.get("marks") or "", a.get("minutes",""))
  rest=o.get("rest",[])
  for a in rest:
    if not full and (a["id"].startswith(("travel:","put_item","prepare_spell","wait","haggle_item","gather(","pet(","light_item"))): continue
    print("  R",a["id"],"|",a["label"],a.get("aspects") or "",a.get("marks") or "",a.get("minutes",""))
  if not full: print("  (+%d hidden routine rests)"%sum(1 for a in rest if a["id"].startswith(("travel:","put_item","prepare_spell","wait","haggle_item","gather(","pet(","light_item"))))
