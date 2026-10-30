// The marks the hex map draws with, in ink with a lit side (see HexLand): what grows or stands on each kind of land,
// and the sign of each kind of place, so that a tower is not a cave is not a shrine at a glance. Their colours are
// their own, written on them: the page's styles do not reach inside a mark used again.
export class HexSymbols {
  static Defs() {
    return (
      <defs>
        <symbol id="h-wood" viewBox="-10 -14 20 18" overflow="visible">
          <path d="M0 2v3" stroke="#2a1f17" strokeWidth="1.2" fill="none" /><circle cx="0" cy="-5" r="5.2" fill="#3F6B45" stroke="#0E1013" strokeWidth="1" /><circle cx="-1.6" cy="-6.6" r="2.2" fill="#5E8F5F" />
        </symbol>
        <symbol id="h-fir" viewBox="-10 -14 20 18" overflow="visible"><path d="M0 -12L-5.5 2H5.5Z" fill="#2F5A3B" stroke="#0E1013" strokeWidth="1" /></symbol>
        <symbol id="h-fell" viewBox="-12 -10 24 12" overflow="visible">
          <path d="M-10 1Q0 -12 10 1" fill="rgba(201,185,143,.12)" stroke="#C9B98F" strokeWidth="1.3" /><path d="M2 0l2 -4M5 0l2 -3M8 0l1 -2" fill="none" stroke="rgba(14,16,19,.55)" strokeWidth="1" />
        </symbol>
        <symbol id="h-peak" viewBox="-12 -16 24 18" overflow="visible">
          <path d="M-11 1L-1 -15L11 1Z" fill="#A9A6A0" stroke="#0E1013" strokeWidth="1.1" /><path d="M-1 -15L11 1H2Z" fill="#6E6B66" /><path d="M-1 -15L-4.5 -10L2.5 -10.5Z" fill="#ECE6D9" />
        </symbol>
        <symbol id="h-heath" viewBox="-6 -6 12 8" overflow="visible"><path d="M-2 1l-1.5 -4M0 1v-5M2 1l1.5 -4" fill="none" stroke="#B48C8E" strokeWidth="1.1" /></symbol>
        <symbol id="h-fen" viewBox="-7 -7 14 9" overflow="visible"><path d="M-5 1H5M-2 1v-5M1 1v-6M3 1v-3.5" fill="none" stroke="#7FC1A6" strokeWidth="1.1" /></symbol>
        <symbol id="h-meadow" viewBox="-4 -4 8 6" overflow="visible"><path d="M-2 1l1 -3M1 1l1 -3" fill="none" stroke="rgba(184,196,132,.6)" strokeWidth="1" /></symbol>
        <symbol id="h-sea" viewBox="-7 -3 14 6" overflow="visible"><path d="M-6 0Q-3 -3 0 0T6 0" fill="none" stroke="rgba(143,187,239,.6)" strokeWidth="1.1" /></symbol>
        <symbol id="h-lake" viewBox="-7 -3 14 6" overflow="visible"><path d="M-6 0Q-3 -3 0 0T6 0" fill="none" stroke="rgba(143,187,239,.6)" strokeWidth="1.1" /></symbol>
        <symbol id="s-town" viewBox="-14 -14 28 22" overflow="visible">
          <path d="M-13 6v-7l4-4 4 4v7zM-4 6v-10l5-5 5 5v10zM6 6v-6l3.5-3.5 3.5 3.5v6z" fill="#CFC6B4" stroke="#0E1013" strokeWidth="1.1" />
          <path d="M-14 -1l5-5 5 5M-5 -4l6-6 6 6M5 0l4.5-4.5 4.5 4.5" fill="none" stroke="#9C5B3E" strokeWidth="2.2" />
        </symbol>
        <symbol id="s-tower" viewBox="-10 -12 20 20" overflow="visible"><path d="M-3 5V-7H3V5M-4 -7V-10M0 -7V-10M4 -7V-10M-1 -3h2" /></symbol>
        <symbol id="s-ruin" viewBox="-10 -12 20 20" overflow="visible"><path d="M-7 5V-3A7 7 0 0 1 4 -6M5 5V0M-2 5V1" /></symbol>
        <symbol id="s-cave" viewBox="-10 -12 20 20" overflow="visible"><path d="M-9 5Q0 -13 9 5M-3 5Q0 -2 3 5" /></symbol>
        <symbol id="s-shrine" viewBox="-10 -12 20 20" overflow="visible"><path d="M-7 5H7M-5 5V-3M5 5V-3M-8 -3L0 -9L8 -3" /></symbol>
        <symbol id="s-barrow" viewBox="-10 -12 20 20" overflow="visible"><path d="M-9 4Q0 -9 9 4M-1 -4V-9" /></symbol>
        <symbol id="s-camp" viewBox="-10 -12 20 20" overflow="visible"><path d="M-8 5L0 -8L8 5M0 -8V5M-3 5L0 0L3 5" /></symbol>
        <symbol id="s-stone" viewBox="-10 -12 20 20" overflow="visible"><path d="M-3 5V-7Q0 -10 3 -7V5Z" /></symbol>
        <symbol id="s-tarn" viewBox="-10 -12 20 20" overflow="visible"><ellipse cx="0" cy="0" rx="8" ry="4.5" /></symbol>
        <symbol id="s-crag" viewBox="-10 -12 20 20" overflow="visible"><path d="M-8 5L-4 -6L-1 -1L3 -9L8 5" /></symbol>
        <symbol id="s-ford" viewBox="-10 -12 20 20" overflow="visible"><path d="M-8 -3H8M-8 2H8M-5 -6v11M5 -6v11" /></symbol>
        <symbol id="s-grove" viewBox="-10 -12 20 20" overflow="visible"><circle cx="-3" cy="-2" r="4" /><circle cx="3" cy="-4" r="4" /><path d="M-3 2v4M3 0v6" /></symbol>
        <symbol id="s-gate" viewBox="-10 -12 20 20" overflow="visible"><path d="M-7 6V-4H7V6M-4 6V-1H4V6M-8 -4L0 -10L8 -4" /></symbol>
        <symbol id="s-place" viewBox="-10 -12 20 20" overflow="visible"><path d="M0 -8L6 -1.5L0 5L-6 -1.5Z" /></symbol>
        <symbol id="s-unknown" viewBox="-10 -12 20 20" overflow="visible"><path d="M-3.5 -4.5a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.2-1.5 2.3v.8M0 4.6v.4" /></symbol>
        <radialGradient id="h-glow"><stop offset="0" stopColor="rgba(242,189,76,.5)" /><stop offset="1" stopColor="rgba(242,189,76,0)" /></radialGradient>
        <linearGradient id="h-light" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="rgba(255,240,210,.09)" />
          <stop offset="1" stopColor="rgba(0,0,0,.14)" /></linearGradient>
        <radialGradient id="h-dark" cx="50%" cy="50%" r="75%"><stop offset="55%" stopColor="rgba(11,12,15,0)" />
          <stop offset="100%" stopColor="rgba(11,12,15,.8)" /></radialGradient>
      </defs>
    );
  }
}
