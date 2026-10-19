// Deliberately symbolic scene plates: presentation only, with no world-state mutations.
export class FolioArt {
  static scene(kind: string): string {
    const sky = `<rect width="1200" height="640" fill="url(#sky)"/>
      <circle cx="850" cy="130" r="68" fill="#d4c4a0" opacity=".35"/>
      <path d="M0 340 Q150 180 380 315 T800 285 T1200 260 V640 H0Z" fill="#344b48"/>
      <path d="M0 380 Q240 260 460 390 T900 330 T1200 380 V640 H0Z" fill="#1d3434"/>`;
    const town = `<path d="M0 475 Q500 370 1200 470 V640 H0Z" fill="#172d30"/>
      <path d="M160 640 Q490 400 960 435" fill="none" stroke="#6d8278" stroke-width="70" opacity=".4"/>
      <path d="M170 430 V270 H410 V440 M140 270 L290 175 L440 270Z" fill="#293a38" stroke="#9a9277" stroke-width="3"/>
      <path d="M640 425 V300 H900 V440 M610 300 L760 205 L930 300Z" fill="#35443c" stroke="#7b7f66" stroke-width="3"/>
      <path d="M205 285 H370 M230 300 V405 M350 300 V415 M690 310 V400 M850 310 V420" stroke="#152a2b" stroke-width="15"/>
      <rect x="275" y="335" width="50" height="105" fill="#d9a86c" opacity=".7"/>
      <path d="M500 470 L500 270 M480 300 H570 M570 300 V350" stroke="#152624" stroke-width="9"/>
      <path d="M560 340 H580 L590 370 H550Z" fill="#e9ba6d"/>`;
    const wild = `<path d="M350 640 L610 350 L675 350 L790 640Z" fill="#7c8170"/>
      <path d="M490 640 L630 360" stroke="#b3ae87" stroke-width="2"/>
      <path d="M80 640 Q180 400 120 180 M110 310 Q0 240 5 430 M120 240 Q350 90 340 380
      M1060 640 Q990 380 1070 130 M1060 230 Q850 100 830 410 M1070 210 Q1220 190 1190 440"
      stroke="#142c2b" stroke-width="30" fill="none"/>
      <path d="M170 270 Q200 380 180 500 M270 250 Q320 370 290 470 M910 240 Q870 330 900 490 M1160 250 V480"
      stroke="#61775c" stroke-width="9" fill="none"/>`;
    const dungeon = `<rect width="1200" height="640" fill="#101f23"/>
      <path d="M100 640 V180 Q600 -120 1100 180 V640 M210 640 V235 Q600 -10 990 235 V640"
      fill="none" stroke="#4d5752" stroke-width="80"/>
      <path d="M0 640 L425 390 H775 L1200 640Z" fill="#394640"/>
      <path d="M420 390 V240 Q600 30 780 240 V390" fill="#081518" stroke="#898974" stroke-width="5"/>
      <path d="M155 310 H205 M1000 310 H1050 M150 430 H210 M995 430 H1050" stroke="#a5976a" stroke-width="4"/>
      <path d="M0 570 H1200 M200 490 H1000 M345 430 H855 M600 390 V640" stroke="#162b2c" stroke-width="5"/>
      <circle cx="250" cy="330" r="95" fill="url(#glow)"/><circle cx="950" cy="330" r="95" fill="url(#glow)"/>
      <path d="M250 350 L235 315 L250 270 L266 315Z M950 350 L936 315 L951 270 L966 315Z" fill="#d7aa60"/>`;
    const battle = `<circle cx="590" cy="260" r="100" fill="#182d30" stroke="#8e8968" stroke-width="2" opacity=".9"/>
      <path d="M530 200 L650 320 M650 200 L530 320" stroke="#d5c398" stroke-width="12"/>
      <path d="M510 295 L555 335 M625 335 L670 295" stroke="#b99457" stroke-width="8"/>
      <circle cx="590" cy="260" r="130" fill="none" stroke="#947e55" stroke-dasharray="2 18"/>`;
    return `<svg viewBox="0 0 1200 640" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#7c8776"/><stop offset="1" stop-color="#233b3c"/></linearGradient>
      <radialGradient id="glow"><stop stop-color="#e0ad64" stop-opacity=".35"/><stop offset="1" stop-color="#e0ad64" stop-opacity="0"/></radialGradient></defs>
      ${kind === 'town' ? sky + town : kind === 'wild' ? sky + wild : dungeon}
      ${kind === 'combat' ? battle : ''}
      <path d="M0 620 Q380 550 1200 625" stroke="#a9b8a1" opacity=".1" stroke-width="55" fill="none"/>
    </svg>`;
  }
  static portrait(index: number): string {
    return `<svg viewBox="0 0 100 110" aria-hidden="true"><path d="M5 110 Q10 65 50 65 Q90 65 95 110"
      fill="${['#718974', '#b49c6b', '#8a859c'][index % 3]}"/><ellipse cx="50" cy="42" rx="22" ry="28" fill="#b5b69a"/>
      <path d="M27 43 Q18 4 52 8 Q86 10 72 52 L65 24 L36 25Z" fill="#243a3b"/>
      <path d="M38 44 H43 M57 44 H62" stroke="#20302d" stroke-width="3"/></svg>`;
  }
}
