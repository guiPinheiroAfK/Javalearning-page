const COLORS = ["#a78bfa", "#4ade80", "#facc15", "#f472b6", "#60a5fa"];
const PIECES = Array.from({ length: 24 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 13) % 40) / 100,
  duration: 1.2 + ((i * 7) % 80) / 100,
  color: COLORS[i % COLORS.length],
}));

// Animação sutil de confete quando o usuário acerta 100% do quiz.
// Sem lib externa: só spans com CSS keyframes (ver .confetti-piece em index.css).
export function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PIECES.map((piece, i) => (
        <span
          key={i}
          className="confetti-piece absolute top-0 h-2 w-2 rounded-sm"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
