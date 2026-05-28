// components/GalerieComplete.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Heart, 
  Grid3x3, 
  LayoutGrid, 
  Image as ImageIcon,
  Search,
  Loader2,
  AlertCircle
} from "lucide-react";
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

interface GalleryImage {
  id: string;
  image: string;
  title: string;
  date: string;
  location: string;
  description: string;
  category: string;
  likes: number;
  views: number;
}

const categories = [
  { id: "all", label: "Tous", icon: ImageIcon },
  { id: "concert", label: "Concerts", icon: Calendar },
  { id: "repetition", label: "Répétitions", icon: MapPin },
  { id: "festival", label: "Festivals", icon: MapPin },
  { id: "atelier", label: "Ateliers", icon: MapPin },
  { id: "rencontre", label: "Rencontres", icon: MapPin },
  { id: "studio", label: "Studio", icon: MapPin },
  { id: "celebration", label: "Célébrations", icon: MapPin }
];

const layouts = [
  { id: "grid", icon: Grid3x3, label: "Grille" },
  { id: "masonry", icon: LayoutGrid, label: "Mosaïque" },
];

export default function GalerieComplete() {
  const [events, setEvents] = useState<Event[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLayout, setActiveLayout] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
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
        .order('date', { ascending: false });

      if (error) throw error;

      // Transformer les événements en format galerie
      const transformedEvents: GalleryImage[] = (data || [])
        .filter(event => event.image_url && event.status !== 'annule')
        .map(event => ({
          id: event.id,
          image: event.image_url,
          title: event.titre,
          date: formatDate(event.date),
          location: event.place || "Lieu non spécifié",
          description: event.description || "Aucune description disponible",
          category: getCategoryFromCategories(event.categories || []),
          likes: Math.floor(Math.random() * 500) + 50, // Générer des likes aléatoires
          views: Math.floor(Math.random() * 5000) + 200 // Générer des vues aléatoires
        }));

      setEvents(data || []);
      setGalleryImages(transformedEvents);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryFromCategories = (categories: string[]): string => {
    if (!categories || categories.length === 0) return "concert";
    
    const categoryMap: Record<string, string> = {
      "Concert": "concert",
      "Spectacle": "concert",
      "Répétition": "repetition",
      "Festival": "festival",
      "Atelier": "atelier",
      "Workshop": "atelier",
      "Rencontre": "rencontre",
      "Studio": "studio",
      "Enregistrement": "studio",
      "Célébration": "celebration",
      "Gala": "celebration"
    };
    
    for (const cat of categories) {
      if (categoryMap[cat]) return categoryMap[cat];
    }
    
    return "concert";
  };

  const filteredImages = galleryImages.filter(img => {
    const matchesCategory = activeCategory === "all" || img.category === activeCategory;
    const matchesSearch = img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          img.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          img.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalLikes = galleryImages.reduce((sum, img) => sum + img.likes, 0);
  const totalViews = galleryImages.reduce((sum, img) => sum + img.views, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 py-32 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Chargement de la galerie...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Titre et retour */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Retour</span>
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Galerie Complète
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredImages.length} photos
              </span>
            </div>

            {/* Recherche */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par titre ou lieu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtres et layout */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          {/* Catégories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.label}
                </span>
              </button>
            ))}
          </div>

          {/* Layout */}
          <div className="flex gap-2">
            {layouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => setActiveLayout(layout.id)}
                className={`p-2 rounded-lg transition-all ${
                  activeLayout === layout.id
                    ? "bg-purple-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700"
                }`}
                title={layout.label}
              >
                <layout.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Grille des images */}
        {filteredImages.length > 0 ? (
          <div className={`${
            activeLayout === "grid" 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              : "columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4"
          }`}>
            {filteredImages.map((item) => (
              <div
                key={item.id}
                className="group relative cursor-pointer break-inside-avoid mb-4"
                onClick={() => setSelectedImage(item)}
              >
                <div className="relative rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>

                  {/* Overlay informations */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-white/80">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {item.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {item.views}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badge catégorie */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium capitalize">
                    {item.category}
                  </div>

                  {/* Informations compactes */}
                  <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{item.date.split(" ")[0]}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                        <Heart className="w-2.5 h-2.5" />
                        <span>{item.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune photo trouvée</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "Aucun résultat pour votre recherche" : "Aucun événement avec image disponible pour le moment"}
            </p>
          </div>
        )}

        {/* Statistiques */}
        {galleryImages.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{galleryImages.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Photos totales</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalLikes}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Likes cumulés</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalViews}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Vues totales</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}