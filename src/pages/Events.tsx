import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Users, ChevronRight, Tag, Loader2, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Event = {
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
};

const categoriesList = ["Tous", "Sport", "Culturel", "Formation", "Orientation", "Solidarité", "Voyage", "Institutionnel"];

// Mapping des statuts
const getEventStatus = (status: string): "upcoming" | "past" => {
  if (status === 'a_venir' || status === 'en_cours') return "upcoming";
  return "past";
};

// Mapping des catégories pour les emojis
const getCategoryEmoji = (categories: string[]): string => {
  if (!categories || categories.length === 0) return "📅";
  const category = categories[0];
  const emojis: Record<string, string> = {
    Sport: "⚽",
    Culturel: "🎭",
    Formation: "📚",
    Orientation: "🎯",
    Solidarité: "🤝",
    Voyage: "✈️",
    Institutionnel: "📋"
  };
  return emojis[category] || "📅";
};

// Couleurs des catégories
const categoryColors: Record<string, string> = {
  Sport: "hsl(217 91% 60%)",
  Culturel: "hsl(280 70% 60%)",
  Formation: "hsl(142 70% 45%)",
  Orientation: "hsl(27 96% 61%)",
  Solidarité: "hsl(0 75% 60%)",
  Voyage: "hsl(190 80% 50%)",
  Institutionnel: "hsl(220 15% 55%)",
};

// Fonction getStatusBadge
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'a_venir':
      return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">À venir</span>;
    case 'en_cours':
      return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">En cours</span>;
    case 'termine':
      return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Terminé</span>;
    case 'annule':
      return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Annulé</span>;
    default:
      return null;
  }
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [category, setCategory] = useState("Tous");
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
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
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

  // Fonction pour télécharger l'image
  const downloadImage = async (imageUrl: string, eventTitle: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nettoie le titre pour en faire un nom de fichier valide
      const cleanTitle = eventTitle
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50);
      
      const extension = blob.type.split('/')[1] || 'jpg';
      link.download = `${cleanTitle}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Succès",
        description: "Image téléchargée avec succès",
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image",
        variant: "destructive",
      });
    }
  };

  const filteredEvents = events.filter((event) => {
    const eventStatus = getEventStatus(event.status);
    const matchesTab = eventStatus === tab;
    const matchesCategory = category === "Tous" || (event.categories && event.categories.includes(category));
    return matchesTab && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-32 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: "hsl(var(--primary))" }} />
            <p className="text-muted-foreground">Chargement des événements...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header avec image de fond */}
      <div 
        className="relative pt-24 pb-12 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/1.jpeg')",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        {/* Overlay sombre pour rendre le texte lisible */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="relative container mx-auto px-4 text-center py-10 space-y-4 z-10">
          <span className="badge-primary inline-block" style={{ background: "hsl(var(--primary) / 0.25)", color: "hsl(210 100% 85%)" }}>
            Programme
          </span>
          <h1 className="font-display font-bold text-4xl md:text-5xl" style={{ color: "hsl(0 0% 98%)" }}>
            Nos événements
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "hsl(210 40% 75%)" }}>
            Des activités pour tous les goûts tout au long de l'année.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 rounded-xl border w-fit" style={{ background: "hsl(var(--secondary))", borderColor: "hsl(var(--border))" }}>
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={
                tab === t
                  ? { background: "hsl(var(--card))", color: "hsl(var(--primary))", boxShadow: "0 1px 4px hsl(var(--primary) / 0.15)" }
                  : { color: "hsl(var(--muted-foreground))" }
              }
            >
              {t === "upcoming" ? "🗓 À venir" : "✅ Passés"}
            </button>
          ))}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categoriesList.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5"
              style={
                category === c
                  ? { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
                  : { background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }
              }
            >
              {c !== "Tous" && <Tag className="w-3 h-3" />}
              {c}
            </button>
          ))}
        </div>

        {/* Events grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => {
            const eventCategory = event.categories?.[0] || "Autre";
            const categoryColor = categoryColors[eventCategory] || "hsl(var(--primary))";
            const isHighlight = event.status === 'a_venir' && event.places_disponibles < event.capacite_max * 0.3;
            
            return (
              <div
                key={event.id}
                className={`glass-card relative overflow-hidden ${isHighlight ? "ring-2 ring-primary/50" : ""}`}
              >
                {isHighlight && (
                  <div
                    className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold rounded-bl-xl z-10"
                    style={{ background: "var(--gradient-accent)", color: "hsl(var(--accent-foreground))" }}
                  >
                    ⭐ À ne pas manquer
                  </div>
                )}

                {/* Section Image avec téléchargement au clic */}
                {event.image_url && (
                  <div 
                    className="h-40 overflow-hidden rounded-t-lg cursor-pointer relative group"
                    onClick={() => downloadImage(event.image_url, event.titre)}
                  >
                    <img 
                      src={event.image_url} 
                      alt={event.titre}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {/* Overlay de téléchargement au survol */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-3">
                        <Download className="w-6 h-6 text-gray-800" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Placeholder si pas d'image */}
                {!event.image_url && (
                  <div className="h-40 rounded-t-lg mb-4 bg-gray-100 flex flex-col items-center justify-center gap-2">
                    <Calendar className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Aucune image</span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl"
                      style={{ background: categoryColor + "18" }}
                    >
                      {getCategoryEmoji(event.categories)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-display font-semibold leading-snug">{event.titre}</h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="badge-primary text-xs"
                          style={{
                            background: categoryColor + "18",
                            color: categoryColor,
                          }}
                        >
                          {eventCategory}
                        </span>
                        {getStatusBadge(event.status)}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {event.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary))" }} />
                      {new Date(event.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    {event.heure && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary))" }} />
                        {event.heure}
                      </span>
                    )}
                    {event.place && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary))" }} />
                        {event.place}
                      </span>
                    )}
                    {event.capacite_max > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" style={{ color: "hsl(var(--primary))" }} />
                        {event.places_disponibles} places restantes / {event.capacite_max}
                      </span>
                    )}
                  </div>

                  {(event.status === 'a_venir' || event.status === 'en_cours') && (
                    <div className="mt-4 flex items-center justify-between">
                      {event.capacite_max > 0 && event.places_disponibles !== undefined && (
                        <div className="flex-1 mr-4">
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--secondary))" }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${((event.capacite_max - event.places_disponibles) / event.capacite_max) * 100}%`,
                                background: event.places_disponibles < 15 ? "hsl(var(--accent))" : "hsl(var(--primary))",
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <button 
                        className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
                        onClick={() => {
                          toast({
                            title: "Inscription",
                            description: `Inscription à ${event.titre} en cours de développement`,
                          });
                        }}
                      >
                        S'inscrire <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {(event.status === 'termine' || event.status === 'annule') && (
                    <div className="mt-3">
                      <span className="badge-muted">
                        {event.status === 'termine' ? 'Événement terminé' : 'Événement annulé'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <p className="text-4xl">📭</p>
            <p className="font-display font-semibold text-lg">Aucun événement dans cette catégorie</p>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              {tab === "upcoming" 
                ? "Aucun événement à venir pour le moment. Revenez bientôt !"
                : "Aucun événement passé dans cette catégorie."}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}