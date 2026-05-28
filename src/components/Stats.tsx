const stats = [
  { value: "120+", label: "Membres actifs" },
  { value: "40+", label: "Événements par an" },
  { value: "8", label: "Années d'existence" },
  { value: "15+", label: "Partenaires" },
];

export default function Stats() {
  return (
    <section className="container mx-auto px-4 -mt-2 pb-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {stats.map((s, i) => (
          <div key={i} className="glass-card text-center">
            <div
              className="font-display font-bold text-3xl md:text-4xl"
              style={{ color: "hsl(var(--primary))" }}
            >
              {s.value}
            </div>
            <div className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}