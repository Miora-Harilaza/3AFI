import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";

export default function CTA() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div
        className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 animate-float"
          style={{ background: "radial-gradient(circle, hsl(var(--accent)), transparent 70%)" }}
        />
        <div className="relative z-10 space-y-6">
          <h2 className="font-display font-bold text-3xl md:text-4xl" style={{ color: "hsl(0 0% 98%)" }}>
            Prêt(e) à rejoindre l'aventure ?
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "hsl(210 40% 75%)" }}>
            Rejoins notre communauté et participe à des événements enrichissants tout au long de l'année.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-accent">
              S'inscrire maintenant <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/evenements"
              className="btn-outline text-sm"
              style={{ borderColor: "hsl(210 100% 75%)", color: "hsl(210 100% 85%)" }}
            >
              <Calendar className="w-4 h-4" />
              Voir le programme
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}