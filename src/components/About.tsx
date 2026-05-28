import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, ChevronLeft, ChevronRight, X, Play, Pause, Music, Loader2, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import ImageModal from "./ImageModal";

interface Event {
  id: string;
  titre: string;
  date: string;
  heure: string;
  categories: string[];
  place: string;
  description: string;
  image_url: string;
  capacite_max: number;
  places_disponibles: number;
  status: 'a_venir' | 'en_cours' | 'termine' | 'annule';
  created_at: string;
}

export default function About() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Event | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollInterval = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('evenement')
        .select('*')
        .order('date', { ascending: false })
        .limit(20); // Limiter à 20 événements récents

      if (error) throw error;
      
      // Filtrer pour n'afficher que les événements avec image et non annulés
      const validEvents = (data || []).filter(event => 
        event.image_url && 
        event.status !== 'annule'
      );
      
      setEvents(validEvents);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Dupliquer les événements pour un effet infini
  const duplicatedEvents = events.length > 0 ? [...events, ...events, ...events] : [];

  useEffect(() => {
    if (!isAutoPlaying || events.length === 0) return;

    autoScrollInterval.current = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        if (scrollLeft >= maxScroll - 1) {
          scrollContainerRef.current.scrollTo({
            left: 1,
            behavior: 'auto'
          });
        } else {
          scrollContainerRef.current.scrollBy({
            left: 1.2,
            behavior: 'smooth'
          });
        }
      }
    }, 25);

    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, [isAutoPlaying, events.length]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current && events.length > 0) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        
        if (scrollLeft >= maxScroll - 5) {
          scrollContainerRef.current.scrollTo({
            left: 1,
            behavior: 'auto'
          });
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [events.length]);

  const handleUserInteraction = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const scroll = (direction: 'left' | 'right') => {
    handleUserInteraction();
    if (scrollContainerRef.current) {
      const scrollAmount = 280;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'a_venir':
        return <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/90 text-white">À venir</span>;
      case 'en_cours':
        return <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/90 text-white">En cours</span>;
      case 'termine':
        return <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/90 text-white">Terminé</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-5 border border-primary/10">
              <Music className="w-4 h-4" />
              <span>Galerie d'émotions</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-3 tracking-tight">
              Nos moments
              <span className="font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent ml-2">
                précieux
              </span>
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 mx-auto" />
          </div>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-5 border border-primary/10">
              <Music className="w-4 h-4" />
              <span>Galerie d'émotions</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-3 tracking-tight">
              Nos moments
              <span className="font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent ml-2">
                précieux
              </span>
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 mx-auto" />
            <p className="text-muted-foreground max-w-lg mx-auto mt-4 text-sm">
              Un voyage à travers nos plus beaux souvenirs musicaux
            </p>
          </div>
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500">Aucun événement disponible pour le moment</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4">
        {/* Header avec écriture plus grande */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium mb-5 border border-primary/10">
            <Music className="w-4 h-4" />
            <span>Galerie d'émotions</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-foreground mb-3 tracking-tight">
            Nos moments
            <span className="font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent ml-2">
              précieux
            </span>
          </h2>
          <div className="w-24 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 mx-auto" />
          <p className="text-muted-foreground max-w-lg mx-auto mt-4 text-sm">
            Un voyage à travers nos plus beaux souvenirs musicaux
          </p>
        </div>

        {/* Contrôles plus grands */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-border bg-white/50 dark:bg-slate-800/50 hover:bg-primary hover:text-white text-muted-foreground flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
              isAutoPlaying 
                ? "bg-primary text-white border-primary" 
                : "bg-white/50 dark:bg-slate-800/50 border-border text-muted-foreground"
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-border bg-white/50 dark:bg-slate-800/50 hover:bg-primary hover:text-white text-muted-foreground flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Carrousel avec effet infini */}
        <div className="relative group max-w-5xl mx-auto">
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            onTouchStart={handleUserInteraction}
          >
            <div className="flex gap-4 pb-5">
              {duplicatedEvents.map((event, index) => (
                <div
                  key={`${event.id}-${index}`}
                  className="flex-none w-60 group/card cursor-pointer"
                  onClick={() => setSelectedImage(event)}
                >
                  <div className="relative rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.titre}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <Music className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                      {getStatusBadge(event.status)}
                    </div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="font-medium text-sm mb-1 line-clamp-1">{event.titre}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-white/80">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        {event.place && (
                          <div className="flex items-center gap-1.5 text-xs text-white/80 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{event.place}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Informations */}
                    <div className="p-3 border-t border-border/50">
                      <h3 className="text-sm font-medium text-foreground mb-1 line-clamp-1">
                        {event.titre}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      {event.place && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{event.place}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-md hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Indicateur */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
            <div className={`w-1.5 h-1.5 rounded-full ${isAutoPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">
              {isAutoPlaying ? 'Défilement infini' : 'Mode manuel'}
            </span>
            <div className="w-1 h-1 rounded-full bg-primary/30" />
            <span className="text-xs text-muted-foreground">∞</span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to="/galerie"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all text-sm font-medium"
          >
            Explorer la galerie complète
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <ImageModal
          image={{
            id: selectedImage.id,
            image: selectedImage.image_url,
            title: selectedImage.titre,
            date: formatDate(selectedImage.date),
            location: selectedImage.place,
            description: selectedImage.description
          }}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.96);
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
          animation: scale-up 0.2s ease-out;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}