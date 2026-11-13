#!/bin/bash
# p.sh start NAME args...   | p.sh send NAME "cmd" [timeout]  | p.sh stop NAME
D=/var/tmp/kyrie/play21
op=$1; n=$2; shift 2
case $op in
start)
  : > $D/$n.in; : > $D/$n.log
  args="$*"
  setsid nohup bash -c "cd /var/tmp/kyrie/wt-m21-play && tail -f $D/$n.in | bin/kyrie $args > $D/$n.log 2>&1; echo '[[EXIT]]' >> $D/$n.log" > /dev/null 2>&1 < /dev/null &
  t=0; while [ $t -lt 240 ]; do sleep 1; t=$((t+1)); tail -c 2 $D/$n.log | grep -q '> ' && break; grep -q '\[\[EXIT' $D/$n.log && break; done
  echo "[ready after ${t}s]"; cat $D/$n.log
  wc -c < $D/$n.log > $D/$n.off ;;
send)
  off=$(cat $D/$n.off); to=${2:-120}
  echo "$1" >> $D/$n.in
  t=0; sleep 0.3
  while [ $t -lt $to ]; do
    sz=$(wc -c < $D/$n.log)
    if [ $sz -gt $off ] && tail -c 2 $D/$n.log | grep -qE '> |: '; then break; fi
    grep -q '\[\[EXIT' $D/$n.log && break
    sleep 0.5; t=$((t+1)); done
  tail -c +$((off+1)) $D/$n.log
  wc -c < $D/$n.log > $D/$n.off ;;
stop)
  echo q >> $D/$n.in; sleep 2; ps -eo pid,cmd | awk -v f="$D/$n.in" '$2=="tail" && $4==f {print $1}' | xargs -r kill ;;
esac
