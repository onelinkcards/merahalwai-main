export function VegDotInline({ isVeg, size = 14 }: { isVeg: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 22 22" width={size} height={size} fill="none" aria-hidden>
      <rect x="1" y="1" width="20" height="20" rx="3" stroke={isVeg ? "#16A34A" : "#B91C1C"} strokeWidth="2.5" fill="none" />
      {isVeg ? (
        <circle cx="11" cy="11" r="5" fill="#16A34A" />
      ) : (
        <polygon points="11,5 17,17 5,17" fill="#B91C1C" />
      )}
    </svg>
  );
}
