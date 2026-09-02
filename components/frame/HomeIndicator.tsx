export function HomeIndicator() {
  return (
    <div
      className="device-frame-homeindicator absolute left-1/2 -translate-x-1/2 pointer-events-none"
      style={{ bottom: 8, width: 134, height: 5, borderRadius: 999, background: 'rgba(24,24,27,0.18)' }}
      aria-hidden="true"
    />
  );
}
