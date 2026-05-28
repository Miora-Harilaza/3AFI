import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, MapPin, Users, FileText, Eye, ChevronDown, ChevronUp, Download, X, CheckCircle, Image, Sparkles, TrendingUp, Heart, Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import html2canvas from "html2canvas";

type Reunion = {
    id: string;
    titre: string;
    date: string;
    heure_debut: string;
    heure_fin: string;
    lieu: string;
    description: string;
    ordre_du_jour: string[];
    participants: string[];
    status: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
    created_at: string;
    updated_at: string;
};

type Protocole = {
    id: string;
    reunion_id: string;
    contenu: string;
    decisions: string[];
    actions: { action: string; responsable: string; deadline: string }[];
    created_at: string;
    updated_at: string;
};

export default function ReunionsPublic() {
    const [reunions, setReunions] = useState<Reunion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
    const [protocole, setProtocole] = useState<Protocole | null>(null);
    const [showProtocoleModal, setShowProtocoleModal] = useState(false);
    const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
    const [selectedStatus, setSelectedStatus] = useState<string>("tous");
    const [downloadingImage, setDownloadingImage] = useState(false);
    const protocoleRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchReunions();
    }, []);

    const toggleCardExpansion = (id: string) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const fetchReunions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reunion')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setReunions(data || []);
        } catch (error: any) {
            console.error('Error fetching reunions:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les réunions",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchProtocole = async (reunionId: string) => {
        try {
            const { data, error } = await supabase
                .from('protocole')
                .select('*')
                .eq('reunion_id', reunionId)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error: any) {
            console.error('Error fetching protocole:', error);
            return null;
        }
    };

    const viewProtocole = async (reunion: Reunion) => {
        setSelectedReunion(reunion);
        const data = await fetchProtocole(reunion.id);
        setProtocole(data || null);
        setShowProtocoleModal(true);
    };

    // Fonction pour télécharger l'image sur mobile et desktop
    const downloadProtocoleAsImage = async () => {
        if (!protocoleRef.current) return;
        
        setDownloadingImage(true);
        try {
            const element = protocoleRef.current;
            
            // Configuration optimisée pour mobile
            const canvas = await html2canvas(element, {
                scale: 2.5, // Meilleure qualité sur mobile
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: false,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                onclone: (clonedDoc, element) => {
                    // Ajustements pour le clonage
                    const clonedElement = clonedDoc.body;
                    clonedElement.style.background = '#ffffff';
                }
            });
            
            // Convertir en blob pour meilleure compatibilité mobile
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95);
            });
            
            const url = URL.createObjectURL(blob);
            
            // Détection mobile
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            if (isMobile) {
                // Sur mobile, création d'un lien de téléchargement
                const link = document.createElement('a');
                link.href = url;
                link.download = `protocole_${selectedReunion?.titre.replace(/\s/g, '_')}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                toast({
                    title: "Succès",
                    description: "L'image a été sauvegardée dans vos téléchargements",
                });
            } else {
                // Sur desktop, téléchargement standard
                const link = document.createElement('a');
                link.href = url;
                link.download = `protocole_${selectedReunion?.titre.replace(/\s/g, '_')}.jpg`;
                link.click();
                
                toast({
                    title: "Succès",
                    description: "Le protocole a été téléchargé en format JPG",
                });
            }
            
            // Nettoyage
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
            
        } catch (error) {
            console.error('Error generating image:', error);
            toast({
                title: "Erreur",
                description: "Impossible de générer l'image. Veuillez réessayer.",
                variant: "destructive",
            });
        } finally {
            setDownloadingImage(false);
        }
    };

    // Fonction pour partager l'image (nouvelle fonctionnalité mobile)
    const shareProtocole = async () => {
        if (!protocoleRef.current) return;
        
        setDownloadingImage(true);
        try {
            const element = protocoleRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
            });
            
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
            });
            
            const file = new File([blob], `protocole_${selectedReunion?.titre.replace(/\s/g, '_')}.jpg`, { type: 'image/jpeg' });
            
            if (navigator.share) {
                await navigator.share({
                    title: `Protocole - ${selectedReunion?.titre}`,
                    text: `Protocole de la réunion du ${new Date(selectedReunion?.date || '').toLocaleDateString('fr-FR')}`,
                    files: [file]
                });
                toast({
                    title: "Succès",
                    description: "Protocole partagé avec succès",
                });
            } else {
                // Fallback au téléchargement
                downloadProtocoleAsImage();
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                toast({
                    title: "Erreur",
                    description: "Impossible de partager l'image",
                    variant: "destructive",
                });
            }
        } finally {
            setDownloadingImage(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { bg: string; text: string; label: string; icon: string }> = {
            planifiee: { bg: "bg-gradient-to-r from-blue-500 to-blue-600", text: "text-white", label: "Planifiée", icon: "📅" },
            en_cours: { bg: "bg-gradient-to-r from-green-500 to-green-600", text: "text-white", label: "En cours", icon: "⚡" },
            terminee: { bg: "bg-gradient-to-r from-gray-500 to-gray-600", text: "text-white", label: "Terminée", icon: "✅" },
            annulee: { bg: "bg-gradient-to-r from-red-500 to-red-600", text: "text-white", label: "Annulée", icon: "❌" }
        };
        const c = config[status] || config.planifiee;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text} flex items-center gap-1 shadow-md`}>
                <span>{c.icon}</span> {c.label}
            </span>
        );
    };

    const filteredReunions = reunions.filter(reunion => {
        if (selectedStatus === "tous") return true;
        return reunion.status === selectedStatus;
    });

    const totalReunions = reunions.length;
    const completedReunions = reunions.filter(r => r.status === 'terminee').length;
    const upcomingReunions = reunions.filter(r => r.status === 'planifiee').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-gray-500">Chargement des réunions...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <Navbar />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 pt-32 pb-20">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                
                <div className="container mx-auto px-4 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span className="text-white text-sm font-medium">Vie associative</span>
                    </div>
                    <h1 className="font-bold text-4xl md:text-7xl text-white mb-4">
                        Nos réunions
                    </h1>
                    <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto px-4">
                        Restez informé de toutes nos rencontres et accédez aux comptes-rendus
                    </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 80" fill="none" className="w-full">
                        <path d="M0 80L1440 80L1440 40C1200 80 960 10 720 40C480 70 240 0 0 40L0 80Z" fill="#f3f4f6" />
                    </svg>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
                {/* Statistiques responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 md:p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-xs md:text-sm">Total réunions</p>
                                <p className="text-2xl md:text-4xl font-bold mt-1 md:mt-2">{totalReunions}</p>
                            </div>
                            <Calendar className="w-8 h-8 md:w-12 md:h-12 text-white/30" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 md:p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-xs md:text-sm">Réunions terminées</p>
                                <p className="text-2xl md:text-4xl font-bold mt-1 md:mt-2">{completedReunions}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-white/30" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 md:p-6 text-white shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-xs md:text-sm">À venir</p>
                                <p className="text-2xl md:text-4xl font-bold mt-1 md:mt-2">{upcomingReunions}</p>
                            </div>
                            <Heart className="w-8 h-8 md:w-12 md:h-12 text-white/30" />
                        </div>
                    </div>
                </div>

                {/* Filtres responsive */}
                <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-8 md:mb-10">
                    {[
                     
                        { value: "planifiee", label: "Planifiées", color: "bg-blue-600" },
                        { value: "en_cours", label: "En cours", color: "bg-green-600" },
                        { value: "terminee", label: "Terminées", color: "bg-gray-600" },
                        { value: "annulee", label: "Annulées", color: "bg-red-600" }
                    ].map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setSelectedStatus(filter.value)}
                            className={`px-3 md:px-6 py-1.5 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 flex items-center gap-1 md:gap-2 shadow-md ${
                                selectedStatus === filter.value
                                    ? `${filter.color} text-white scale-105`
                                    : "bg-white text-gray-600 hover:bg-gray-100 hover:scale-105"
                            }`}
                        >
                          
                            <span className="hidden sm:inline">{filter.label}</span>
                        </button>
                    ))}
                </div>

                {/* Grille des réunions */}
                <div className="grid gap-6 md:gap-8">
                    {filteredReunions.map((reunion) => (
                        <div 
                            key={reunion.id} 
                            className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                        >
                            <div className="relative h-1 md:h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                            
                            <div className="p-4 md:p-6 cursor-pointer" onClick={() => toggleCardExpansion(reunion.id)}>
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 md:gap-3 flex-wrap mb-2 md:mb-3">
                                            <h3 className="font-bold text-lg md:text-2xl text-gray-800 group-hover:text-blue-600 transition-colors">
                                                {reunion.titre}
                                            </h3>
                                            {getStatusBadge(reunion.status)}
                                        </div>

                                        {/* Informations clés responsive */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4">
                                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 p-1 md:p-2 rounded-lg hover:bg-blue-50 transition-colors">
                                                <div className="p-1 md:p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                                                    <Calendar className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                                </div>
                                                <span className="text-xs md:text-sm">{new Date(reunion.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 p-1 md:p-2 rounded-lg hover:bg-purple-50 transition-colors">
                                                <div className="p-1 md:p-1.5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                                                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                                </div>
                                                <span>{reunion.heure_debut || "---"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 p-1 md:p-2 rounded-lg hover:bg-orange-50 transition-colors">
                                                <div className="p-1 md:p-1.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                                                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                                </div>
                                                <span className="truncate">{reunion.lieu || "Lieu"}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-xs md:text-sm text-gray-600 p-1 md:p-2 rounded-lg hover:bg-green-50 transition-colors">
                                                <div className="p-1 md:p-1.5 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                                                    <Users className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {reunion.participants && reunion.participants.length > 0 && reunion.participants[0] !== "" ? (
                                                        <>
                                                            {reunion.participants.slice(0, 2).map((participant, idx) => (
                                                                <span key={idx} className="inline-block px-1.5 md:px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                                                    {participant.length > 10 ? participant.substring(0, 8) + '...' : participant}
                                                                </span>
                                                            ))}
                                                            {reunion.participants.length > 2 && (
                                                                <span className="inline-block px-1.5 md:px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                                                                    +{reunion.participants.length - 2}
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">Aucun</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {reunion.description && (
                                            <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">{reunion.description}</p>
                                        )}

                                        {/* Indicateur d'expansion */}
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1 md:mt-2">
                                            {expandedCards[reunion.id] ? (
                                                <><ChevronUp className="w-3 h-3 md:w-4 md:h-4" /> <span className="text-xs">Voir moins</span></>
                                            ) : (
                                                <><ChevronDown className="w-3 h-3 md:w-4 md:h-4" /> <span className="text-xs">Voir plus</span></>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bouton Voir protocole responsive */}
                                    {reunion.status !== 'annulee' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); viewProtocole(reunion); }}
                                            className="inline-flex items-center justify-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg text-xs md:text-sm"
                                        >
                                            <Eye className="w-3 h-3 md:w-4 md:h-4" />
                                            <span>Voir</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Contenu expansé */}
                            {expandedCards[reunion.id] && (
                                <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 md:p-6 space-y-3 md:space-y-4">
                                    {reunion.ordre_du_jour && reunion.ordre_du_jour.length > 0 && reunion.ordre_du_jour[0] !== "" && (
                                        <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm">
                                            <h4 className="font-semibold text-gray-700 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                                                <div className="w-1 h-4 md:h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                                                Ordre du jour
                                            </h4>
                                            <ul className="space-y-1 md:space-y-2">
                                                {reunion.ordre_du_jour.map((item, idx) => (
                                                    <li key={idx} className="text-xs md:text-sm text-gray-600 flex items-start gap-2">
                                                        <span className="text-blue-500 mt-0.5">•</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {reunion.participants && reunion.participants.length > 0 && reunion.participants[0] !== "" && (
                                        <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm">
                                            <h4 className="font-semibold text-gray-700 mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                                                <div className="w-1 h-4 md:h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                                                Participants
                                            </h4>
                                            <div className="flex flex-wrap gap-1 md:gap-2">
                                                {reunion.participants.map((participant, idx) => (
                                                    <span key={idx} className="inline-flex items-center gap-1 px-2 md:px-3 py-1 bg-gradient-to-r from-green-50 to-green-100 rounded-full text-xs md:text-sm shadow-sm">
                                                        <Users className="w-2 h-2 md:w-3 md:h-3 text-green-600" />
                                                        {participant}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {filteredReunions.length === 0 && (
                        <div className="text-center py-12 md:py-20 bg-white rounded-2xl shadow-xl">
                            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-4">
                                <Calendar className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                            </div>
                            <p className="text-lg md:text-xl text-gray-500 mb-2">Aucune réunion trouvée</p>
                            <p className="text-sm md:text-base text-gray-400">Essayez de modifier vos filtres</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Visualisation Protocole avec options mobile */}
            {showProtocoleModal && selectedReunion && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                            <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Protocole
                            </h2>
                            <button onClick={() => setShowProtocoleModal(false)} className="p-1 md:p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 md:p-6 space-y-4 md:space-y-6" ref={protocoleRef}>
                            {/* En-tête */}
                            <div className="text-center border-b border-gray-200 pb-4 md:pb-6">
                                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-3 md:px-4 py-1 md:py-2 mb-3 md:mb-4">
                                    <FileText className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="text-xs md:text-sm font-medium">PROTOCOLE OFFICIEL</span>
                                </div>
                                <h3 className="text-xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">{selectedReunion.titre}</h3>
                                <p className="text-xs md:text-sm text-gray-500">Document officiel de la réunion</p>
                            </div>

                            {/* Informations */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                                <div className="flex items-center gap-2 text-xs md:text-sm">
                                    <Calendar className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                                    <span className="text-gray-600 font-medium">Date:</span>
                                    <span>{new Date(selectedReunion.date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs md:text-sm">
                                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                                    <span className="text-gray-600 font-medium">Heure:</span>
                                    <span>{selectedReunion.heure_debut || "---"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs md:text-sm">
                                    <MapPin className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                                    <span className="text-gray-600 font-medium">Lieu:</span>
                                    <span className="truncate">{selectedReunion.lieu || "Non spécifié"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs md:text-sm">
                                    <Users className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                                    <span className="text-gray-600 font-medium">Participants:</span>
                                    <span>{selectedReunion.participants?.length || 0}</span>
                                </div>
                            </div>

                            {/* Contenu protocole */}
                            {protocole ? (
                                <>
                                    <div>
                                        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3 flex items-center gap-2">
                                            <div className="w-1 h-4 md:h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                                            Compte-rendu
                                        </h3>
                                        <div className="bg-gray-50 rounded-xl p-3 md:p-5 whitespace-pre-wrap text-gray-700 text-sm md:text-base leading-relaxed">
                                            {protocole.contenu || "Aucun contenu disponible"}
                                        </div>
                                    </div>

                                    {protocole.decisions && protocole.decisions.length > 0 && protocole.decisions[0] !== "" && (
                                        <div>
                                            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3 flex items-center gap-2">
                                                <div className="w-1 h-4 md:h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                                                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                                                Décisions prises
                                            </h3>
                                            <ul className="space-y-1 md:space-y-2">
                                                {protocole.decisions.map((decision: string, idx: number) => (
                                                    <li key={idx} className="flex items-start gap-2 p-2 md:p-3 bg-green-50 rounded-xl text-sm md:text-base">
                                                        <span className="text-green-600 mt-0.5 font-bold">✓</span>
                                                        <span className="text-gray-700">{decision}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {protocole.actions && protocole.actions.length > 0 && protocole.actions[0]?.action !== "" && (
                                        <div>
                                            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3 flex items-center gap-2">
                                                <div className="w-1 h-4 md:h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
                                                Actions à mener
                                            </h3>
                                            <div className="space-y-2 md:space-y-3">
                                                {protocole.actions.map((action: any, idx: number) => (
                                                    <div key={idx} className="border border-gray-200 rounded-xl p-3 md:p-4 hover:shadow-md transition-shadow bg-white">
                                                        <p className="font-medium text-gray-800 mb-1 md:mb-2 text-sm md:text-base">{action.action}</p>
                                                        <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                                                            {action.responsable && (
                                                                <span className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-gray-100 rounded-lg">
                                                                    <Users className="w-2 h-2 md:w-3 md:h-3" />
                                                                    {action.responsable}
                                                                </span>
                                                            )}
                                                            {action.deadline && (
                                                                <span className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-gray-100 rounded-lg">
                                                                    <Calendar className="w-2 h-2 md:w-3 md:h-3" />
                                                                    {new Date(action.deadline).toLocaleDateString('fr-FR')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 md:py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full mb-4">
                                        <FileText className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 text-sm md:text-base">Aucun protocole n'est encore disponible</p>
                                </div>
                            )}
                        </div>

                        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row gap-2 md:gap-3">
                            {protocole && protocole.contenu && (
                                <>
                                    <button
                                        onClick={downloadProtocoleAsImage}
                                        disabled={downloadingImage}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 md:py-2.5 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2 shadow-lg text-sm md:text-base disabled:opacity-50"
                                    >
                                        {downloadingImage ? (
                                            <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Download className="w-3 h-3 md:w-4 md:h-4" />
                                        )}
                                        <span className="text-xs md:text-sm">Télécharger</span>
                                    </button>
                                    
                                    {/* Bouton Partager (spécial mobile) */}
                                    {navigator.share && (
                                        <button
                                            onClick={shareProtocole}
                                            disabled={downloadingImage}
                                            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 md:py-2.5 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg text-sm md:text-base"
                                        >
                                            <Share2 className="w-3 h-3 md:w-4 md:h-4" />
                                            <span className="text-xs md:text-sm">Partager</span>
                                        </button>
                                    )}
                                </>
                            )}
                            <button
                                onClick={() => setShowProtocoleModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm md:text-base"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}