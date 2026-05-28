import { Link } from "react-router-dom";
import { Music, Mail, Phone, MapPin, Heart, ArrowUp} from "lucide-react";
import { useState, useEffect } from "react";

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  // Réseaux sociaux avec les vraies icônes


  return (
    <>
      <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-t border-white/10 mt-20">
        {/* Décoration de fond élégante */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070')] bg-cover bg-center opacity-5" />
          <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section - Style premium */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                  <div
                    className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: "linear-gradient(135deg, #10B981, #14B8A6)",
                      boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)"
                    }}
                  >
                    <Music className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <span className="font-display font-bold text-2xl bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                    STK 3AFI
                  </span>
                  <p className="text-xs text-emerald-300/60 mt-0.5">Arts & Musique</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-300 font-light">
                Une association dédiée à l'art choral, à l'épanouissement musical et au partage de notre passion à travers des performances exceptionnelles.
              </p>
              <div className="flex gap-3 pt-2">
         
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-emerald-400 relative inline-block">
                Navigation
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              </h4>
              <nav className="flex flex-col gap-3">
                {[
                  { to: "/", label: "Accueil", icon: "✨" },
                  { to: "/membres", label: "Membres", icon: "👥" },
                  { to: "/evenements", label: "Événements", icon: "📅" },
                  { to: "/contact", label: "Contact", icon: "💌" },
                  { to: "/galerie", label: "Galerie", icon: "🎨" },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="group flex items-center gap-3 text-sm text-gray-300 hover:text-emerald-400 transition-all duration-300"
                  >
                    <span className="text-base opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-6 group-hover:ml-0">
                      {l.icon}
                    </span>
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      {l.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-emerald-400 relative inline-block">
                Contact
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              </h4>
              <div className="flex flex-col gap-4">
                {[
                  { Icon: Mail, text: "contact@stk3afi.com", href: "mailto:contact@stk3afi.com" },
                  { Icon: Phone, text: "+261 38 83 371 22", href: "tel:+261388337122" },
                  { Icon: MapPin, text: "Antsirabe, Madagascar" },
                ].map(({ Icon, text, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    className="group flex items-center gap-3 text-sm text-gray-300 hover:text-emerald-400 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                      <Icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {text}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-emerald-400 relative inline-block">
                Newsletter
                <div className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              </h4>
              <p className="text-sm text-gray-300 font-light">
                Recevez nos actualités et concerts à venir
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  className="px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button
                  className="group relative px-4 py-3 rounded-xl font-medium text-sm text-white transition-all duration-300 hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  <span className="relative flex items-center justify-center gap-2">
                    S'abonner
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar - Style élégant */}
          <div className="py-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 font-light">
              © {currentYear} STK 3AFI. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/mentions-legales" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors font-light">
                Mentions légales
              </Link>
              <span className="text-xs text-gray-600">•</span>
              <Link to="/politique-confidentialite" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors font-light">
                Confidentialité
              </Link>
              <span className="text-xs text-gray-600">•</span>
              <Link to="/cgv" className="text-xs text-gray-400 hover:text-emerald-400 transition-colors font-light">
                CGV
              </Link>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1 font-light">
              Fait avec <Heart className="w-3 h-3 text-red-400 animate-pulse" /> pour la musique
            </p>
          </div>
        </div>
      </footer>

      {/* Bouton retour en haut - Style cohérent */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 transition-all duration-500 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/40 group ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Retour en haut"
      >
        <ArrowUp className="w-5 h-5 mx-auto group-hover:-translate-y-0.5 transition-transform" />
      </button>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}