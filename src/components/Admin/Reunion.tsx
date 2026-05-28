import { useState, useEffect } from "react";
import {
    Calendar, Clock, MapPin, Users, FileText, Plus, Edit2, Trash2,
    Save, X, Loader2, CheckCircle, AlertCircle, Eye
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Reunion = {
    id: string;
    titre: string;
    date: string;
    heure_debut: string;
    heure_fin: string;
    lieu: string;
    description: string;
    ordre_du_jour: string[];
    protocole: string;
    participants: string[];
    status: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
    created_at: string;
    updated_at: string;
};

export default function AdminReunions() {
    const [reunions, setReunions] = useState<Reunion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showProtocoleModal, setShowProtocoleModal] = useState(false);
    const [showViewProtocoleModal, setShowViewProtocoleModal] = useState(false);
    const [editingReunion, setEditingReunion] = useState<Reunion | null>(null);
    const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
    const [protocole, setProtocole] = useState<any>(null);
    const [viewingProtocole, setViewingProtocole] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        titre: "",
        date: "",
        heure_debut: "",
        heure_fin: "",
        lieu: "",
        description: "",
        ordre_du_jour: [""],
        participants: [""],
        status: "planifiee" as const
    });

    const [protocoleData, setProtocoleData] = useState({
        contenu: "",
        decisions: [""],
        actions: [{ action: "", responsable: "", deadline: "" }]
    });

    useEffect(() => {
        fetchReunions();
    }, []);

    const fetchReunions = async () => {
        setLoading(true);
        try {
            console.log("Tentative de chargement des réunions...");
            const { data, error } = await supabase
                .from('reunion')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error("Erreur Supabase détaillée:", error);
                throw error;
            }

            console.log("Réunions chargées:", data);
            setReunions(data || []);
        } catch (error: any) {
            console.error('Error fetching reunions:', error);
            toast({
                title: "Erreur",
                description: error.message || "Impossible de charger les réunions. Vérifiez les permissions RLS.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReunion = async () => {
        if (!formData.titre || !formData.date) {
            toast({
                title: "Erreur",
                description: "Le titre et la date sont obligatoires",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);
        try {
            const filteredOrdreJour = formData.ordre_du_jour.filter(item => item.trim() !== "");
            const filteredParticipants = formData.participants.filter(p => p.trim() !== "");

            const reunionData = {
                titre: formData.titre,
                date: formData.date,
                heure_debut: formData.heure_debut || null,
                heure_fin: formData.heure_fin || null,
                lieu: formData.lieu || null,
                description: formData.description || null,
                ordre_du_jour: filteredOrdreJour,
                participants: filteredParticipants,
                status: formData.status,
                updated_at: new Date().toISOString()
            };

            console.log("Tentative de sauvegarde:", reunionData);

            if (editingReunion) {
                const { error } = await supabase
                    .from('reunion')
                    .update(reunionData)
                    .eq('id', editingReunion.id);

                if (error) throw error;
                toast({ title: "Succès", description: "Réunion modifiée avec succès" });
            } else {
                const { error } = await supabase
                    .from('reunion')
                    .insert([{
                        ...reunionData,
                        created_at: new Date().toISOString()
                    }]);

                if (error) throw error;
                toast({ title: "Succès", description: "Réunion créée avec succès" });
            }

            setShowModal(false);
            resetForm();
            fetchReunions();
        } catch (error: any) {
            console.error('Error saving reunion:', error);
            toast({
                title: "Erreur",
                description: error.message || "Impossible de sauvegarder la réunion. Vérifiez les permissions.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProtocole = async () => {
        if (!selectedReunion) return;

        setSaving(true);
        try {
            const filteredDecisions = protocoleData.decisions.filter(d => d.trim() !== "");
            const filteredActions = protocoleData.actions.filter(a => a.action.trim() !== "");

            const protocoleDataToSave = {
                reunion_id: selectedReunion.id,
                contenu: protocoleData.contenu,
                decisions: filteredDecisions,
                actions: filteredActions,
                updated_at: new Date().toISOString()
            };

            if (protocole) {
                const { error } = await supabase
                    .from('protocole')
                    .update(protocoleDataToSave)
                    .eq('id', protocole.id);

                if (error) throw error;
                toast({ title: "Succès", description: "Protocole mis à jour avec succès" });
            } else {
                const { error } = await supabase
                    .from('protocole')
                    .insert([{
                        ...protocoleDataToSave,
                        created_at: new Date().toISOString()
                    }]);

                if (error) throw error;
                toast({ title: "Succès", description: "Protocole ajouté avec succès" });
            }

            setShowProtocoleModal(false);
            fetchProtocole(selectedReunion.id);
        } catch (error: any) {
            console.error('Error saving protocole:', error);
            toast({
                title: "Erreur",
                description: error.message || "Impossible de sauvegarder le protocole",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
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
            setProtocole(data || null);
            if (data) {
                setProtocoleData({
                    contenu: data.contenu || "",
                    decisions: data.decisions?.length ? data.decisions : [""],
                    actions: data.actions?.length ? data.actions : [{ action: "", responsable: "", deadline: "" }]
                });
            } else {
                setProtocoleData({
                    contenu: "",
                    decisions: [""],
                    actions: [{ action: "", responsable: "", deadline: "" }]
                });
            }
        } catch (error: any) {
            console.error('Error fetching protocole:', error);
        }
    };

    const viewProtocole = async (reunion: Reunion) => {
        setSelectedReunion(reunion);
        try {
            const { data, error } = await supabase
                .from('protocole')
                .select('*')
                .eq('reunion_id', reunion.id)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setViewingProtocole(data);
                setShowViewProtocoleModal(true);
            } else {
                toast({
                    title: "Information",
                    description: "Aucun protocole n'a encore été ajouté pour cette réunion",
                });
            }
        } catch (error: any) {
            console.error('Error fetching protocole:', error);
            toast({
                title: "Erreur",
                description: "Impossible de charger le protocole",
                variant: "destructive",
            });
        }
    };

    const handleDeleteReunion = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette réunion ?")) return;

        try {
            const { error } = await supabase
                .from('reunion')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({ title: "Succès", description: "Réunion supprimée avec succès" });
            fetchReunions();
        } catch (error: any) {
            console.error('Error deleting reunion:', error);
            toast({
                title: "Erreur",
                description: error.message || "Impossible de supprimer la réunion",
                variant: "destructive",
            });
        }
    };

    const resetForm = () => {
        setEditingReunion(null);
        setFormData({
            titre: "",
            date: "",
            heure_debut: "",
            heure_fin: "",
            lieu: "",
            description: "",
            ordre_du_jour: [""],
            participants: [""],
            status: "planifiee"
        });
    };

    const openEditModal = (reunion: Reunion) => {
        setEditingReunion(reunion);
        setFormData({
            titre: reunion.titre,
            date: reunion.date,
            heure_debut: reunion.heure_debut || "",
            heure_fin: reunion.heure_fin || "",
            lieu: reunion.lieu || "",
            description: reunion.description || "",
            ordre_du_jour: reunion.ordre_du_jour?.length ? reunion.ordre_du_jour : [""],
            participants: reunion.participants?.length ? reunion.participants : [""],
            status: reunion.status
        });
        setShowModal(true);
    };

    const openProtocoleModal = async (reunion: Reunion) => {
        setSelectedReunion(reunion);
        await fetchProtocole(reunion.id);
        setShowProtocoleModal(true);
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            planifiee: "bg-blue-100 text-blue-800",
            en_cours: "bg-green-100 text-green-800",
            terminee: "bg-gray-100 text-gray-800",
            annulee: "bg-red-100 text-red-800"
        };
        const labels = {
            planifiee: "Planifiée",
            en_cours: "En cours",
            terminee: "Terminée",
            annulee: "Annulée"
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen">
           
                <div className="container mx-auto px-4 py-32 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin" style={{ color: "hsl(var(--primary))" }} />
                </div>
          
            </div>
        );
    }

    return (
        <div className="min-h-screen">


            <div className="pt-24 pb-12" style={{ background: "var(--gradient-hero)" }}>
                <div className="container mx-auto px-4 text-center py-10 space-y-4">
                    <h1 className="font-display font-bold text-4xl md:text-5xl" style={{ color: "hsl(0 0% 98%)" }}>
                        Gestion des réunions
                    </h1>
                    <p className="text-lg max-w-xl mx-auto" style={{ color: "hsl(210 40% 75%)" }}>
                        Planifiez et gérez les réunions ainsi que leurs protocoles
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-end mb-8">
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle réunion
                    </button>
                </div>

                <div className="grid gap-6">
                    {reunions.map((reunion) => (
                        <div key={reunion.id} className="glass-card p-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 flex-wrap mb-3">
                                        <h3 className="font-display font-bold text-xl">{reunion.titre}</h3>
                                        {getStatusBadge(reunion.status)}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                                            <Calendar className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
                                            {new Date(reunion.date).toLocaleDateString('fr-FR')}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                                            <Clock className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
                                            {reunion.heure_debut} - {reunion.heure_fin}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                                            <MapPin className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
                                            {reunion.lieu}
                                        </div>
                                        {/* Nouvel affichage des participants */}
                                        <div className="flex items-start gap-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                                            <Users className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--primary))" }} />
                                            <div className="flex flex-wrap gap-1">
                                                {reunion.participants && reunion.participants.length > 0 && reunion.participants[0] !== "" ? (
                                                    reunion.participants.map((participant, idx) => (
                                                        <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                                            {participant}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 italic">Aucun participant</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                                        {reunion.description}
                                    </p>

                                    {reunion.ordre_du_jour && reunion.ordre_du_jour.length > 0 && reunion.ordre_du_jour[0] !== "" && (
                                        <div className="mt-2">
                                            <p className="text-xs font-semibold text-gray-600 mb-1">Ordre du jour :</p>
                                            <ul className="list-disc list-inside text-sm text-gray-600">
                                                {reunion.ordre_du_jour.slice(0, 2).map((item, idx) => (
                                                    <li key={idx}>{item}</li>
                                                ))}
                                                {reunion.ordre_du_jour.length > 2 && (
                                                    <li>+{reunion.ordre_du_jour.length - 2} autres...</li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => viewProtocole(reunion)}
                                        className="p-2 rounded-lg hover:bg-green-100 transition-colors"
                                        title="Voir protocole"
                                    >
                                        <Eye className="w-5 h-5 text-green-600" />
                                    </button>
                                    <button
                                        onClick={() => openProtocoleModal(reunion)}
                                        className="p-2 rounded-lg hover:bg-blue-100 transition-colors"
                                        title="Ajouter/Modifier protocole"
                                    >
                                        <FileText className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
                                    </button>
                                    <button
                                        onClick={() => openEditModal(reunion)}
                                        className="p-2 rounded-lg hover:bg-yellow-100 transition-colors"
                                        title="Modifier réunion"
                                    >
                                        <Edit2 className="w-5 h-5 text-yellow-600" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteReunion(reunion.id)}
                                        className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {reunions.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-lg" style={{ color: "hsl(var(--muted-foreground))" }}>
                                Aucune réunion pour le moment
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="btn-primary mt-4"
                            >
                                Créer la première réunion
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Réunion */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">
                                {editingReunion ? "Modifier la réunion" : "Nouvelle réunion"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Titre *</label>
                                <input
                                    type="text"
                                    value={formData.titre}
                                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Titre de la réunion"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Statut</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="planifiee">Planifiée</option>
                                        <option value="en_cours">En cours</option>
                                        <option value="terminee">Terminée</option>
                                        <option value="annulee">Annulée</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Heure début</label>
                                    <input
                                        type="time"
                                        value={formData.heure_debut}
                                        onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Heure fin</label>
                                    <input
                                        type="time"
                                        value={formData.heure_fin}
                                        onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Lieu</label>
                                <input
                                    type="text"
                                    value={formData.lieu}
                                    onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Lieu de la réunion"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Description de la réunion..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Ordre du jour</label>
                                {formData.ordre_du_jour.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={(e) => {
                                                const newList = [...formData.ordre_du_jour];
                                                newList[idx] = e.target.value;
                                                setFormData({ ...formData, ordre_du_jour: newList });
                                            }}
                                            placeholder={`Point ${idx + 1}`}
                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {formData.ordre_du_jour.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newList = formData.ordre_du_jour.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, ordre_du_jour: newList });
                                                }}
                                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, ordre_du_jour: [...formData.ordre_du_jour, ""] })}
                                    className="text-sm text-blue-600 hover:underline mt-1"
                                >
                                    + Ajouter un point
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Participants</label>
                                {formData.participants.map((participant, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={participant}
                                            onChange={(e) => {
                                                const newList = [...formData.participants];
                                                newList[idx] = e.target.value;
                                                setFormData({ ...formData, participants: newList });
                                            }}
                                            placeholder={`Participant ${idx + 1}`}
                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {formData.participants.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newList = formData.participants.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, participants: newList });
                                                }}
                                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, participants: [...formData.participants, ""] })}
                                    className="text-sm text-blue-600 hover:underline mt-1"
                                >
                                    + Ajouter un participant
                                </button>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
                            <button
                                onClick={handleSaveReunion}
                                disabled={saving}
                                className="flex-1 btn-primary py-2 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? "Enregistrement..." : "Enregistrer"}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ajout/Modification Protocole */}
            {showProtocoleModal && selectedReunion && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">
                                {protocole ? "Modifier le protocole" : "Ajouter un protocole"} - {selectedReunion.titre}
                            </h2>
                            <button
                                onClick={() => setShowProtocoleModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Contenu du protocole</label>
                                <textarea
                                    value={protocoleData.contenu}
                                    onChange={(e) => setProtocoleData({ ...protocoleData, contenu: e.target.value })}
                                    rows={6}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Résumé de la réunion, points importants, débats..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Décisions prises</label>
                                {protocoleData.decisions.map((decision, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={decision}
                                            onChange={(e) => {
                                                const newList = [...protocoleData.decisions];
                                                newList[idx] = e.target.value;
                                                setProtocoleData({ ...protocoleData, decisions: newList });
                                            }}
                                            placeholder={`Décision ${idx + 1}`}
                                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {protocoleData.decisions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newList = protocoleData.decisions.filter((_, i) => i !== idx);
                                                    setProtocoleData({ ...protocoleData, decisions: newList });
                                                }}
                                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setProtocoleData({ ...protocoleData, decisions: [...protocoleData.decisions, ""] })}
                                    className="text-sm text-blue-600 hover:underline mt-1"
                                >
                                    + Ajouter une décision
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Actions à mener</label>
                                {protocoleData.actions.map((action, idx) => (
                                    <div key={idx} className="border rounded-lg p-4 mb-3">
                                        <div className="grid gap-3">
                                            <input
                                                type="text"
                                                value={action.action}
                                                onChange={(e) => {
                                                    const newList = [...protocoleData.actions];
                                                    newList[idx].action = e.target.value;
                                                    setProtocoleData({ ...protocoleData, actions: newList });
                                                }}
                                                placeholder="Action à mener"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={action.responsable}
                                                    onChange={(e) => {
                                                        const newList = [...protocoleData.actions];
                                                        newList[idx].responsable = e.target.value;
                                                        setProtocoleData({ ...protocoleData, actions: newList });
                                                    }}
                                                    placeholder="Responsable"
                                                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                                <input
                                                    type="date"
                                                    value={action.deadline}
                                                    onChange={(e) => {
                                                        const newList = [...protocoleData.actions];
                                                        newList[idx].deadline = e.target.value;
                                                        setProtocoleData({ ...protocoleData, actions: newList });
                                                    }}
                                                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        {protocoleData.actions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newList = protocoleData.actions.filter((_, i) => i !== idx);
                                                    setProtocoleData({ ...protocoleData, actions: newList });
                                                }}
                                                className="mt-2 text-sm text-red-500 hover:underline"
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setProtocoleData({
                                        ...protocoleData,
                                        actions: [...protocoleData.actions, { action: "", responsable: "", deadline: "" }]
                                    })}
                                    className="text-sm text-blue-600 hover:underline mt-1"
                                >
                                    + Ajouter une action
                                </button>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
                            <button
                                onClick={handleSaveProtocole}
                                disabled={saving}
                                className="flex-1 btn-primary py-2 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? "Enregistrement..." : "Enregistrer le protocole"}
                            </button>
                            <button
                                onClick={() => setShowProtocoleModal(false)}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Visualisation Protocole */}
            {showViewProtocoleModal && viewingProtocole && selectedReunion && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">
                                Protocole - {selectedReunion.titre}
                            </h2>
                            <button
                                onClick={() => setShowViewProtocoleModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Contenu du protocole */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} />
                                    Compte-rendu
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                                    {viewingProtocole.contenu || "Aucun contenu"}
                                </div>
                            </div>

                            {/* Décisions prises */}
                            {viewingProtocole.decisions && viewingProtocole.decisions.length > 0 && viewingProtocole.decisions[0] !== "" && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        Décisions prises
                                    </h3>
                                    <ul className="space-y-2">
                                        {viewingProtocole.decisions.map((decision: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <span className="text-green-600 mt-1">✓</span>
                                                <span className="text-gray-700">{decision}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Actions à mener */}
                            {viewingProtocole.actions && viewingProtocole.actions.length > 0 && viewingProtocole.actions[0]?.action !== "" && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-orange-600" />
                                        Actions à mener
                                    </h3>
                                    <div className="space-y-3">
                                        {viewingProtocole.actions.map((action: any, idx: number) => (
                                            <div key={idx} className="border rounded-lg p-4">
                                                <p className="font-medium text-gray-800 mb-2">{action.action}</p>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                    {action.responsable && (
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            Responsable: {action.responsable}
                                                        </span>
                                                    )}
                                                    {action.deadline && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            Deadline: {new Date(action.deadline).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Métadonnées */}
                            <div className="text-xs text-gray-500 pt-4 border-t">
                                <p>Créé le: {new Date(viewingProtocole.created_at).toLocaleString('fr-FR')}</p>
                                <p>Dernière modification: {new Date(viewingProtocole.updated_at).toLocaleString('fr-FR')}</p>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowViewProtocoleModal(false);
                                    openProtocoleModal(selectedReunion);
                                }}
                                className="flex-1 btn-primary py-2 flex items-center justify-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Modifier le protocole
                            </button>
                            <button
                                onClick={() => setShowViewProtocoleModal(false)}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

         
        </div>
    );
}