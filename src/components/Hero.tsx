import { Link } from "react-router-dom";
import { ArrowRight, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  
  const images = [
    { src: "/1.jpeg", alt: "STK Antsomafi background 1" },
    { src: "/2.jpg", alt: "STK Antsomafi background 2" },
    { src: "/3.jpg", alt: "STK Antsomafi background 3" }
  ];

  // Changement automatique des images
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(interval);
  }, [currentImageIndex]);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setTimeout(() => setIsAnimating(false), 500);
    }, 100);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      setTimeout(() => setIsAnimating(false), 500);
    }, 100);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentImageIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setTimeout(() => setIsAnimating(false), 500);
    }, 100);
  };

  const handleImageError = (src: string) => {
    setImageErrors(prev => ({ ...prev, [src]: true }));
  };

  const currentImage = images[currentImageIndex];
  const hasError = imageErrors[currentImage?.src];

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Conteneur d'image avec effet parallaxe */}
      <div className="absolute inset-0 w-full h-full z-0">
        {!hasError ? (
          <>
            {/* Image principale avec zoom subtil */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <img
                key={currentImage.src}
                src={currentImage.src}
                alt={currentImage.alt}
                className="w-full h-full object-cover object-center"
                onError={() => handleImageError(currentImage.src)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  animation: 'subtleZoom 12s ease-out forwards',
                }}
              />
            </div>
            
            {/* Dégradé animé au survol */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 transition-all duration-1000" />
            
            {/* Indicateurs de progression avec animation */}
            <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-3 z-20">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className="group cursor-pointer transition-all duration-300 hover:scale-110"
                  aria-label={`Aller à l'image ${idx + 1}`}
                >
                  <div className="relative">
                    <div
                      className={`transition-all duration-500 rounded-full ${
                        idx === currentImageIndex
                          ? 'w-10 h-2 bg-white shadow-lg shadow-white/20'
                          : 'w-2 h-2 bg-white/40 group-hover:bg-white/70 group-hover:w-4'
                      }`}
                    />
                    {idx === currentImageIndex && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white/30 rounded-full animate-pulse" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Boutons de navigation flottants */}
            <button
              onClick={prevSlide}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-300 hover:scale-110 group"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-all duration-300 hover:scale-110 group"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Compteur d'images élégant */}
            <div className="absolute bottom-28 right-4 md:right-8 z-20 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-sm text-white/80 text-xs font-medium">
              {String(currentImageIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </div>
          </>
        ) : (
          <div 
            className="w-full h-full"
            style={{ background: "var(--gradient-hero)" }}
          />
        )}
      </div>
      
      {/* Overlay sombre avec dégradé dynamique */}
      <div 
        className="absolute inset-0 z-1 transition-all duration-1000"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Effet de lumière dynamique */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30 pointer-events-none z-1"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          animation: 'pulse 8s ease-in-out infinite',
        }}
      />

      {/* Decorative blobs animés */}
      <div
        className="absolute top-10 sm:top-20 right-5 sm:right-10 w-32 sm:w-56 md:w-72 h-32 sm:h-56 md:h-72 rounded-full opacity-20 animate-float z-2"
        style={{ 
          background: "radial-gradient(circle, hsl(var(--primary-glow)), transparent 70%)",
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-28 sm:w-48 md:w-56 h-28 sm:h-48 md:h-56 rounded-full opacity-15 animate-float-delayed z-2"
        style={{ 
          background: "radial-gradient(circle, hsl(var(--accent)), transparent 70%)",
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />

      {/* Contenu principal avec animations améliorées - Version corrigée */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-4 sm:mb-6">
            <span 
              className="inline-block"
              style={{ 
                color: "hsl(0 0% 98%)",
                animation: 'slideDown 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
              }}
            >
              STK ANTSOMAFI
            </span>
            <br />
            <span 
              className="inline-block mt-2 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl"
              style={{ 
                color: "hsl(var(--accent))",
                animation: 'slideUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              1 Korintiana 13:4-5
            </span>
          </h1>

          {/* Texte corrigé - maintenant visible */}
          <div className="max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 px-4 sm:px-6">
            <p 
              className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed"
              style={{ 
                color: "hsl(210 40% 85%)",
                animation: 'fadeIn 1s ease-out 0.4s forwards',
                opacity: 0,
                animationFillMode: 'forwards'
              }}
            >
              “Ny fitiavana dia mahari-po sady mora fanahy; tsy mialona; tsy mirehareha; tsy mieboebo...”
            </p>
          </div>

          <div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
            style={{
              animation: 'fadeUp 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s forwards',
              opacity: 0,
              animationFillMode: 'forwards'
            }}
          >
            <Link 
              to="/evenements" 
              className="group btn-accent text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 inline-flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <span className="relative z-10">Voir les événements</span>
              <ArrowRight className="w-4 h-4 ml-2 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
            </Link>
            <Link
              to="/membres"
              className="group btn-outline text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 inline-flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105"
              style={{ borderColor: "hsl(210 100% 75%)", color: "hsl(210 100% 85%)" }}
            >
              <Users className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
              <span>Nos membres</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Wave responsive avec animation */}
      <div className="absolute bottom-0 left-0 right-0 z-10 leading-none" style={{ animation: 'wave 3s ease-in-out infinite' }}>
        <svg 
          viewBox="0 0 1440 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          style={{ height: 'clamp(30px, 6vw, 80px)' }}
          preserveAspectRatio="none"
        >
          <path 
            d="M0 80L1440 80L1440 40C1200 80 960 10 720 40C480 70 240 0 0 40L0 80Z" 
            fill="hsl(220, 20%, 97%)" 
          />
        </svg>
      </div>

      {/* Styles CSS complets */}
      <style>{`
        @keyframes subtleZoom {
          from { transform: scale(1); }
          to { transform: scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(5deg); }
        }
        
        @keyframes floatDelayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-5deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        
        .btn-accent {
          background: linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-dark, 250 70% 55%)));
          color: white;
          border-radius: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .btn-accent:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px hsla(var(--accent), 0.4);
        }
        
        .btn-outline {
          border: 1.5px solid;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        
        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
}