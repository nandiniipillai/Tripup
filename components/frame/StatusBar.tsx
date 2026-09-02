// components/frame/StatusBar.tsx — faux iOS status bar. Static 9:41 (Apple convention),
// so the prototype looks identical whenever it's opened (BUILD-SPEC §2.8, §7).

export function StatusBar() {
  return (
    <div
      className="device-frame-statusbar flex items-center justify-between px-6 shrink-0"
      style={{ height: 47 }}
      aria-hidden="true"
    >
      <span className="text-body font-semibold tabular-nums" style={{ fontSize: 15 }}>9:41</span>
      <div className="flex items-center gap-1">
        {/* signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="7" width="3" height="5" rx="0.5" fill="#18181B" />
          <rect x="5" y="5" width="3" height="7" rx="0.5" fill="#18181B" />
          <rect x="10" y="3" width="3" height="9" rx="0.5" fill="#18181B" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" fill="#18181B" />
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 10.5C8.69 10.5 9.25 9.94 9.25 9.25C9.25 8.56 8.69 8 8 8C7.31 8 6.75 8.56 6.75 9.25C6.75 9.94 7.31 10.5 8 10.5Z" fill="#18181B" />
          <path d="M5.2 6.8C6 6 7 5.6 8 5.6C9 5.6 10 6 10.8 6.8" stroke="#18181B" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M2.6 4.2C4.1 2.7 6 2 8 2C10 2 11.9 2.7 13.4 4.2" stroke="#18181B" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.75" y="0.75" width="20.5" height="10.5" rx="2.5" stroke="#18181B" strokeOpacity="0.4" strokeWidth="1" />
          <rect x="2.25" y="2.25" width="17.5" height="7.5" rx="1.3" fill="#18181B" />
          <path d="M22.5 4.5V7.5C23.2 7.2 23.7 6.4 23.7 6C23.7 5.6 23.2 4.8 22.5 4.5Z" fill="#18181B" fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}
