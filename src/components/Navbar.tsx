import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Music, ChevronDown, Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/membres", label: "Membres" },
  { to: "/reunionspublic", label: "Réunions" },
  { to: "/evenements", label: "Événements" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="h-16 md:h-20 flex items-center justify-between">
            {/* Logo avec animation et image */}
            <Link 
              to="/" 
              className="group relative flex items-center gap-3"
            >
              {/* Anneau décoratif */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-yellow-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Logo avec image */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-yellow-500 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                <div
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 overflow-hidden bg-white"
                  style={{
                    boxShadow: "0 4px 15px rgba(30, 144, 255, 0.3)"
                  }}
                >
                  <img 
                    src="/logo.png" 
                    alt="STK 3AFI" 
                    className="w-8 h-8 object-contain p-1"
                    onError={(e) => {
                      // Fallback si l'image ne charge pas
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const musicIcon = document.createElement('div');
                        musicIcon.innerHTML = '<svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
                        parent.appendChild(musicIcon.firstChild as Node);
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Texte du logo */}
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent">
                  STK 3AFI
                </span>
                <span className="text-[10px] font-medium text-yellow-500 dark:text-yellow-400 -mt-1">
                  Chœur d'excellence
                </span>
              </div>
              <Sparkles className="absolute -top-2 -right-6 w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {links.map((l) => {
                const active = location.pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                      active
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {l.label}
                    </span>
                    {active && (
                      <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-xl -z-0" />
                    )}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-yellow-500 group-hover:w-full transition-all duration-300" />
                  </Link>
                );
              })}
              
              {/* Bouton CTA avec effet - Style bleu et jaune */}
              <Link
                to="/login"
                className="relative ml-4 px-6 py-2 rounded-xl font-medium text-sm text-white transition-all duration-300 overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, #1E90FF, #FFD700)",
                  boxShadow: "0 4px 15px rgba(30, 144, 255, 0.3)"
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Rejoindre
                  <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>

            {/* Mobile toggle avec animation */}
            <button
              className="md:hidden relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {open ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu avec animation élégante */}
        {open && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-xl animate-slide-down">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col gap-2">
                {links.map((l) => {
                  const active = location.pathname === l.to;
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      className={`relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                        active
                          ? "bg-gradient-to-r from-blue-50 to-yellow-50 dark:from-blue-900/20 dark:to-yellow-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        {l.label}
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                      </span>
                    </Link>
                  );
                })}
                
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700 my-2" />
                
                <Link
                  to="/login"
                  className="mt-2 px-4 py-3 rounded-xl font-medium text-sm text-white text-center transition-all duration-300 relative overflow-hidden group"
                  style={{
                    background: "linear-gradient(135deg, #1E90FF, #FFD700)",
                  }}
                >
                  <span className="relative z-10">Rejoindre l'association</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Espace pour compenser la navbar */}
      <div className="h-16 md:h-20" />

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        /* Animation de glow pour le bouton CTA */
        @keyframes pulse-blue {
          0%, 100% {
            box-shadow: 0 4px 15px rgba(30, 144, 255, 0.3);
          }
          50% {
            box-shadow: 0 4px 25px rgba(30, 144, 255, 0.5);
          }
        }

        .group:hover .btn-cta-glow {
          animation: pulse-blue 1.5s infinite;
        }
      `}</style>
    </>
  );
} 