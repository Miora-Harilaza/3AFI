import { Link } from "react-router-dom";
import { ArrowRight, Calendar, MapPin, ChevronLeft, ChevronRight, Play, Pause, Music, Loader2, Sparkles, Clock, Eye, Heart, Share2 } from "lucide-react";
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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
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
        .limit(20);

      if (error) throw error;
      
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
            left: 1,
            behavior: 'smooth'
          });
        }
      }
    }, 30);

    return () => {
      if (autoScrollInterval.current) clearInterval(autoScrollInterval.current);
    };
  }, [isAutoPlaying, events.length]);

  const handleUserInteraction = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const scroll = (direction: 'left' | 'right') => {
    handleUserInteraction();
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
      year: date.getFullYear(),
      full: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    };
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'a_venir':
        return { bg: 'bg-blue-500', text: 'À VENIR', icon: '✨' };
      case 'en_cours':
        return { bg: 'bg-yellow-500', text: 'EN COURS', icon: '🎵' };
      case 'termine':
        return { bg: 'bg-gray-500', text: 'TERMINÉ', icon: '✓' };
      default:
        return { bg: 'bg-blue-500', text: 'À VENIR', icon: '✨' };
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Music className="w-6 h-6 text-blue-500 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-500">Chargement des souvenirs...</p>
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Music className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Aucun événement</h3>
          <p className="text-gray-500">Revenez bientôt pour découvrir nos moments</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white dark:bg-slate-900 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header minimaliste */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            NOTRE GALERIE
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Moments
            <span className="text-blue-600"> précieux</span>
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-yellow-500 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            Découvrez nos plus beaux souvenirs en images
          </p>
        </div>

        {/* Navigation controls */}
        <div className="flex justify-end gap-2 mb-6 max-w-6xl mx-auto">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-400 hover:text-blue-600 flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
              isAutoPlaying 
                ? "border-blue-500 bg-blue-500 text-white" 
                : "border-gray-200 text-gray-400 hover:border-blue-500 hover:text-blue-600"
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-400 hover:text-blue-600 flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            onTouchStart={handleUserInteraction}
          >
            <div className="flex gap-5 pb-4">
              {duplicatedEvents.map((event, index) => {
                const dateObj = formatDate(event.date);
                const statusStyle = getStatusStyle(event.status);
                const isHovered = hoveredCard === `${event.id}-${index}`;
                
                return (
                  <div
                    key={`${event.id}-${index}`}
                    className="flex-none w-72 group"
                    onMouseEnter={() => setHoveredCard(`${event.id}-${index}`)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                      {/* Date badge vertical */}
                      <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-center shadow-sm">
                        <div className="text-lg font-bold text-blue-600 leading-tight">{dateObj.day}</div>
                        <div className="text-[10px] font-medium text-gray-500 uppercase">{dateObj.month}</div>
                      </div>

                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.titre}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50">
                            <Music className="w-10 h-10 text-blue-300" />
                          </div>
                        )}
                        
                        {/* Status badge */}
                        <div className={`absolute bottom-3 left-3 ${statusStyle.bg} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm`}>
                          {statusStyle.text}
                        </div>

                        {/* Overlay on hover */}
                        <div className={`absolute inset-0 bg-blue-600/80 flex items-center justify-center gap-3 transition-all duration-300 ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}>
                          <button 
                            onClick={() => setSelectedImage(event)}
                            className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center hover:scale-110 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center hover:scale-110 transition">
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                          <button className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center hover:scale-110 transition">
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm">
                          {event.titre}
                        </h3>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{dateObj.full}</span>
                          </div>
                          {event.heure && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{event.heure}</span>
                            </div>
                          )}
                        </div>

                        {event.place && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{event.place}</span>
                          </div>
                        )}

                        {/* Progress bar on hover */}
                        <div className="mt-3 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r from-blue-500 to-yellow-500 transition-all duration-500 ${
                              isHovered ? 'w-full' : 'w-0'
                            }`} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats and CTA */}
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{events.length}</div>
                <div className="text-xs text-gray-500">Événements</div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">2024</div>
                <div className="text-xs text-gray-500">Année</div>
              </div>
            </div>
            
            <Link
              to="/galerie"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all text-sm font-medium group"
            >
              <span>Voir toute la galerie</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>

        {/* Auto-play indicator */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 text-[11px] text-gray-400">
            <div className={`w-1.5 h-1.5 rounded-full ${isAutoPlaying ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
            <span>{isAutoPlaying ? 'Défilement automatique' : 'Navigation manuelle'}</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <ImageModal
          image={{
            id: selectedImage.id,
            image: selectedImage.image_url,
            title: selectedImage.titre,
            date: formatDate(selectedImage.date).full,
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