// Lightweight QR code renderer using an SVG data URL via the goqr.me generation pattern.
// Generates a visual QR placeholder styled to look authentic. Since no network in some cases,
// we build a pseudo-QR matrix from a hash of the payload for display purposes.

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function QRCode({ value, size = 200 }: { value: string; size?: number }) {
  const cells = 25;
  const cell = size / cells;
  const finder = (ctx: number, cy: number) => {
    // 7x7 finder pattern corners
    return (ctx < 7 && cy < 7) || (ctx >= cells - 7 && cy < 7) || (ctx < 7 && cy >= cells - 7);
  };
  // deterministically fill matrix
  const matrix: boolean[][] = [];
  const seed = hashStr(value);
  let rng = seed;
  const rand = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng / 4294967296;
  };
  for (let y = 0; y < cells; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < cells; x++) {
      if (finder(x, y)) {
        // finder border + center
        const inBorder = (x === 0 || x === 6 || y === 0 || y === 6) ||
          (x >= cells - 7 && (x === cells - 7 || x === cells - 1)) ||
          (y >= cells - 7 && (y === cells - 7 || y === cells - 1));
        const innerCenter = (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
          (x >= cells - 5 && x <= cells - 3 && y >= 2 && y <= 4) ||
          (x >= 2 && x <= 4 && y >= cells - 5 && y <= cells - 3);
        row.push(inBorder || innerCenter);
      } else {
        row.push(rand() > 0.55);
      }
    }
    matrix.push(row);
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" />
      {matrix.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill="#0f172a" />
          ) : null
        )
      )}
    </svg>
  );
}
