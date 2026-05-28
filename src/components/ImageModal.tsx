// components/ImageModal.tsx
import { X, Calendar, MapPin, Share2, Heart, Download, Maximize2, Minimize2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ImageModalProps {
  image: {
    id: number;
    image: string;
    title: string;
    date: string;
    location: string;
    description: string;
  } | null;
  onClose: () => void;
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (image) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [image]);

  if (!image) return null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />

      {/* Modal content */}
      <div
        className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl animate-scale-up mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec contrôles */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex gap-2">
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
              title={isFullscreen ? "Quitter plein écran" : "Plein écran"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all hover:rotate-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenu principal */}
        <div className="grid md:grid-cols-2 h-full">
          {/* Section image avec zoom */}
          <div className="relative bg-black/50 flex items-center justify-center p-4 min-h-[300px] md:min-h-[500px]">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={image.image}
                alt={image.title}
                className="max-w-full max-h-[60vh] object-contain transition-transform duration-300"
                style={{ transform: `scale(${zoom})` }}
              />
            </div>
            
            {/* Contrôles de zoom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 rounded-full p-1 backdrop-blur-sm">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 text-white disabled:opacity-50 transition-all"
              >
                -
              </button>
              <span className="text-white text-xs px-2 flex items-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 2.5}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 text-white disabled:opacity-50 transition-all"
              >
                +
              </button>
            </div>
          </div>

          {/* Section détails */}
          <div className="p-6 md:p-8 overflow-y-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {image.title}
            </h3>
            
            {/* Métadonnées */}
            <div className="space-y-3 text-muted-foreground mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium text-foreground">{image.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lieu</p>
                  <p className="text-sm font-medium text-foreground">{image.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-2">À propos</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {image.description}
              </p>
            </div>

            {/* Galerie associée */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-foreground mb-3">Moments similaires</h4>
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={image.image}
                      alt="thumbnail"
                      className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  isLiked
                    ? "bg-red-500 text-white"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                {isLiked ? "Aimé" : "Aimer"}
              </button>
              <button className="flex-1 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-all flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Partager
              </button>
              <button className="w-10 h-10 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-all flex items-center justify-center">
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>ID: #{image.id}</span>
                <span>Résolution: 1920x1080</span>
                <span>Format: JPEG</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-scale-up {
          animation: scale-up 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}