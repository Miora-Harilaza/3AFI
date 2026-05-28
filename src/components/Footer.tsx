import { Link } from "react-router-dom";
import { Music, Mail, Phone, MapPin, Heart, ArrowUp } from "lucide-react";
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

  // Réseaux sociaux sans les icônes lucide-react
  const socialLinks = [
    { 
      name: "Facebook",
      href: "https://web.facebook.com/profile.php?id=61586985007549", 
      label: "Facebook", 
      color: "#1877F2",
      icon: "f"
    },
    
   
  ];

  return (
    <>
      <footer className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 border-t border-gray-200/50 dark:border-gray-800/50 mt-20">
        {/* Décoration de fond */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                  <div
                    className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"
                    }}
                  >
                    <Music className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="font-display font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    STK ANTSO MA FI
                  </span>
                  
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                Une association dédiée à l'art choral, à l'épanouissement musical et au partage de notre passion à travers des performances exceptionnelles.
              </p>
              <div className="flex gap-3 pt-2">
                {socialLinks.map(({ name, href, label, color, icon }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 font-bold"
                    style={{
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      fontSize: "1.2rem"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = color;
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "";
                      e.currentTarget.style.color = "";
                    }}
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation Links - reste identique */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 relative inline-block">
                Navigation
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </h4>
              <nav className="flex flex-col gap-2">
                {[
                  { to: "/", label: "Accueil", icon: "✨" },
                  { to: "/membres", label: "Membres", icon: "👥" },
                  { to: "/evenements", label: "Événements", icon: "📅" },
                  { to: "/contact", label: "Contact", icon: "💌" },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="group flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300"
                  >
                    <span className="text-base opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-5 group-hover:ml-0">
                      {l.icon}
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {l.label}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact Info - reste identique */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 relative inline-block">
                Contact
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </h4>
              <div className="flex flex-col gap-4">
                {[
                  { Icon: Mail, text: "mioramh@gmail.com", href: "mailto:contact@stkantsomafi.org" },
                  { Icon: Phone, text: "038 83 371 22", href: "tel:+261341234567" },
                  { Icon: MapPin, text: "Antsirabe, Madagascar" },
                ].map(({ Icon, text, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    className="group flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {text}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter Section - reste identique */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 relative inline-block">
                Newsletter
                <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recevez nos actualités et concerts à venir
              </p>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <button
                  className="px-4 py-2.5 rounded-xl font-medium text-sm text-white transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                    boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"
                  }}
                >
                  S'abonner
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © {currentYear} STK ANTSO MA FI. Tous droits réservés.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/mentions-legales" className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Mentions légales
              </Link>
              <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
              <Link to="/politique-confidentialite" className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Confidentialité
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              Fait avec <Heart className="w-3 h-3 text-red-500 animate-pulse" /> pour la musique
            </p>
          </div>
        </div>
      </footer>

      {/* Bouton retour en haut */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-all duration-500 hover:scale-110 hover:shadow-xl ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Retour en haut"
      >
        <ArrowUp className="w-5 h-5 mx-auto" />
      </button>
    </>
  );
}