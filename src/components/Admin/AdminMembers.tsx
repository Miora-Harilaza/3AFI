import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/services/api';
import { 
  Trash2, Edit2, Plus, X, Search, Filter, ChevronLeft, ChevronRight, 
  User, Phone, Briefcase, Calendar, MapPin, Upload, Eye, Grid, List, 
  CheckCircle, XCircle, AlertCircle, Users, UserPlus, Award, Heart, 
  Sparkles, Activity, Mail, TrendingUp, Download, Printer, 
  Shield, Clock, Star, Crown, Music, IdCard, Palette, Copy, Check
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface Member {
  id: string;
  user_id: string | null;
  nom: string;
  poste: string | null;
  adresse: string | null;
  date_naissance: string | null;
  telephone: string | null;
  sexe: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
  status: 'actif' | 'inactif' | 'suspendu';
  created_at: string;
  updated_at: string;
}

// Thèmes de couleurs prédéfinis
const colorThemes = [
  { name: 'Pourpre Royal', primary: '#7C3AED', secondary: '#A855F7', accent: '#FBBF24', bg: 'linear-gradient(135deg, #1a1a2e 0%, #2d1b69 100%)' },
  { name: 'Bleu Céleste', primary: '#2563EB', secondary: '#3B82F6', accent: '#60A5FA', bg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' },
  { name: 'Vert Émeraude', primary: '#059669', secondary: '#10B981', accent: '#FCD34D', bg: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)' },
  { name: 'Rouge Passion', primary: '#DC2626', secondary: '#EF4444', accent: '#FBBF24', bg: 'linear-gradient(135deg, #450a0a 0%, #991b1b 100%)' },
  { name: 'Or Élégant', primary: '#D97706', secondary: '#F59E0B', accent: '#FEF08A', bg: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)' },
  { name: 'Rose Féérique', primary: '#DB2777', secondary: '#EC4899', accent: '#FBCFE8', bg: 'linear-gradient(135deg, #311b2b 0%, #831843 100%)' },
  { name: 'Cyan Océan', primary: '#0891B2', secondary: '#06B6D4', accent: '#67E8F9', bg: 'linear-gradient(135deg, #042f2e 0%, #155e75 100%)' },
  { name: 'Violet Mystique', primary: '#9333EA', secondary: '#A855F7', accent: '#E9D5FF', bg: 'linear-gradient(135deg, #2e1065 0%, #581c87 100%)' },
];

const AdminMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [badgeMember, setBadgeMember] = useState<Member | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [customColor, setCustomColor] = useState('#7C3AED');
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [copied, setCopied] = useState(false);
  const itemsPerPage = 9;
  const badgeRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    nom: '',
    poste: '',
    adresse: '',
    date_naissance: '',
    telephone: '',
    sexe: '',
    status: 'actif' as 'actif' | 'inactif' | 'suspendu'
  });

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('list');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await api.membres.getAll();
      setMembers(data);
    } catch (err) {
      setError('Erreur lors du chargement des membres');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WEBP.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Fichier trop volumineux. Maximum 5MB.');
        return;
      }
      
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setError(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      poste: '',
      adresse: '',
      date_naissance: '',
      telephone: '',
      sexe: '',
      status: 'actif'
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsAdding(false);
    setIsEditing(false);
    setSelectedMember(null);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      setError('Le nom est requis');
      return;
    }
    
    setUploading(true);
    try {
      const insertData: any = {
        nom: formData.nom,
        poste: formData.poste || null,
        adresse: formData.adresse || null,
        date_naissance: formData.date_naissance || null,
        telephone: formData.telephone || null,
        status: formData.status
      };
      
      if (formData.sexe && formData.sexe.trim() !== '') {
        insertData.sexe = formData.sexe;
      } else {
        insertData.sexe = null;
      }
      
      const newMember = await api.membres.create(insertData, selectedFile || undefined);
      setMembers([newMember, ...members]);
      resetForm();
      setError(null);
    } catch (err: any) {
      console.error('Full error:', err);
      setError(`Erreur lors de l'ajout: ${err.message || 'Vérifiez la console'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      nom: member.nom,
      poste: member.poste || '',
      adresse: member.adresse || '',
      date_naissance: member.date_naissance || '',
      telephone: member.telephone || '',
      sexe: member.sexe || '',
      status: member.status
    });
    setPreviewUrl(member.avatar_url);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMember) return;
    
    setUploading(true);
    try {
      const updateData: any = {
        nom: formData.nom,
        poste: formData.poste || null,
        adresse: formData.adresse || null,
        date_naissance: formData.date_naissance || null,
        telephone: formData.telephone || null,
        status: formData.status
      };
      
      if (formData.sexe && formData.sexe.trim() !== '') {
        updateData.sexe = formData.sexe;
      } else {
        updateData.sexe = null;
      }
      
      const updatedMember = await api.membres.update(
        selectedMember.id,
        updateData,
        selectedFile || undefined
      );
      setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
      resetForm();
      setError(null);
    } catch (err: any) {
      console.error('Update error details:', err);
      setError(`Erreur lors de la mise à jour: ${err.message || 'Vérifiez la console'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre définitivement ?')) {
      try {
        await api.membres.delete(id);
        setMembers(members.filter(m => m.id !== id));
        setError(null);
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'actif' | 'inactif' | 'suspendu') => {
    try {
      const updatedMember = await api.membres.changeStatus(id, newStatus);
      setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
      setError(null);
    } catch (err) {
      setError('Erreur lors du changement de statut');
      console.error(err);
    }
  };

  const handleDownloadBadge = async () => {
    if (badgeRef.current) {
      setDownloading(true);
      try {
        const element = badgeRef.current;
        
        // Attendre le chargement complet
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // S'assurer que toutes les images sont chargées
        const images = element.getElementsByTagName('img');
        await Promise.all(Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }));
        
        const canvas = await html2canvas(element, {
          scale: 3,
          backgroundColor: null,
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: 265,
          height: 340,
          windowWidth: 265,
          windowHeight: 340,
        });
        
        // Créer l'image finale aux dimensions exactes (7x9 cm = 265x340 pixels à 96 DPI)
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 265;
        finalCanvas.height = 340;
        const ctx = finalCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, 0, 0, 265, 340);
        }
        
        const link = document.createElement('a');
        link.download = `badge-${badgeMember?.nom.replace(/\s/g, '-')}.png`;
        link.href = finalCanvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        setError('Erreur lors du téléchargement du badge. Veuillez réessayer.');
      } finally {
        setDownloading(false);
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur de copie:', err);
    }
  };

  const openBadgeModal = (member: Member) => {
    setBadgeMember(member);
    setShowBadgeModal(true);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (member.poste && member.poste.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (member.telephone && member.telephone.includes(searchTerm)) ||
                          (member.adresse && member.adresse.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'tous' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non renseignée';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'actif': return 'bg-green-500';
      case 'inactif': return 'bg-gray-500';
      case 'suspendu': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'actif': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactif': return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'suspendu': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'actif': return 'Actif';
      case 'inactif': return 'Inactif';
      case 'suspendu': return 'Suspendu';
      default: return status;
    }
  };

  const getSexeText = (sexe: string | null) => {
    if (!sexe) return 'Non renseigné';
    return sexe === 'Homme' ? 'Homme' : sexe === 'Femme' ? 'Femme' : 'Autre';
  };

  const activeMembers = members.filter(m => m.status === 'actif').length;
  const inactiveMembers = members.filter(m => m.status === 'inactif').length;
  const membersWithPoste = members.filter(m => m.poste && m.poste !== '').length;
  
  // Calcul des statistiques hommes/femmes
  const menCount = members.filter(m => m.sexe === 'Homme').length;
  const womenCount = members.filter(m => m.sexe === 'Femme').length;

  const currentTheme = useCustomColor 
    ? { name: 'Personnalisé', primary: customColor, secondary: customColor, accent: '#FBBF24', bg: `linear-gradient(135deg, #1a1a2e 0%, ${customColor} 100%)` }
    : colorThemes[selectedTheme];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Music className="w-8 h-8 text-purple-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Chargement des membres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium text-yellow-300">Gestion des membres</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Gestion des membres</h1>
            <p className="text-purple-100">Gérez l'équipe de l'association</p>
          </div>
          <div className="hidden md:block">
            <button
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="bg-white text-purple-600 px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2"
            >
              <Plus size={20} />
              Ajouter un membre
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { title: 'Membres totaux', value: members.length, icon: Users, color: 'from-blue-500 to-blue-600' },
          { title: 'Membres actifs', value: activeMembers, icon: Heart, color: 'from-green-500 to-green-600' },
          { title: 'Avec poste', value: membersWithPoste, icon: Award, color: 'from-purple-500 to-purple-600' },
          { title: 'Inactifs', value: inactiveMembers, icon: User, color: 'from-gray-500 to-gray-600' },
          { title: 'Hommes', value: menCount, icon: Users, color: 'from-cyan-500 to-cyan-600' },
          { title: 'Femmes', value: womenCount, icon: Users, color: 'from-pink-500 to-pink-600' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-r ${stat.color} shadow-md`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="tous">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="suspendu">Suspendu</option>
            </select>
            
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' : 'text-gray-500'}`}>
                <Grid size={20} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 text-purple-600 shadow-sm' : 'text-gray-500'}`}>
                <List size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Vue Grille */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedMembers.map((member) => (
            <div key={member.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
              <div className={`h-1 ${getStatusClass(member.status)}`}></div>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.nom} className="w-14 h-14 rounded-full object-cover border-2 border-purple-500" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">{member.nom.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{member.nom}</h3>
                        {member.poste && <p className="text-xs text-purple-600 font-medium">{member.poste}</p>}
                        <div className="flex items-center gap-1 mt-1">
                          {getStatusIcon(member.status)}
                          <span className="text-xs text-gray-500">{getStatusText(member.status)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setViewingMember(member)} className="text-blue-500 hover:text-blue-700 p-1 transition" title="Voir">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEditMember(member)} className="text-green-500 hover:text-green-700 p-1 transition" title="Modifier">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteMember(member.id)} className="text-red-500 hover:text-red-700 p-1 transition" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                        <button onClick={() => openBadgeModal(member)} className="text-purple-500 hover:text-purple-700 p-1 transition" title="Badge">
                          <IdCard size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {paginatedMembers.map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className={`h-1 ${getStatusClass(member.status)}`}></div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.nom} className="w-12 h-12 rounded-full object-cover border-2 border-purple-500" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">{member.nom.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{member.nom}</h3>
                      {member.poste && <p className="text-sm text-purple-600">{member.poste}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewingMember(member)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => handleEditMember(member)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteMember(member.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={18} />
                    </button>
                    <button onClick={() => openBadgeModal(member)} className="p-2 text-purple-500 hover:bg-purple-50 rounded-lg transition">
                      <IdCard size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 bg-white dark:bg-gray-800 rounded-xl border disabled:opacity-50">
            <ChevronLeft size={18} />
          </button>
          <span className="px-4 py-2 bg-purple-600 text-white rounded-xl">{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 bg-white dark:bg-gray-800 rounded-xl border disabled:opacity-50">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Modal Badge - Format 7x9 cm (265x340px) */}
      {showBadgeModal && badgeMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Badge personnalisable - {badgeMember.nom}</h2>
                <button onClick={() => setShowBadgeModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1 transition">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Sélecteur de thèmes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Palette size={16} />
                  Choisir la couleur du badge
                </label>
                
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {colorThemes.map((theme, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedTheme(index);
                        setUseCustomColor(false);
                      }}
                      className={`h-12 rounded-lg transition-all duration-200 ${
                        !useCustomColor && selectedTheme === index ? 'ring-2 ring-purple-600 ring-offset-2 scale-105' : 'hover:scale-105'
                      }`}
                      style={{ background: theme.bg }}
                      title={theme.name}
                    />
                  ))}
                  <button
                    onClick={() => setUseCustomColor(true)}
                    className={`h-12 rounded-lg transition-all duration-200 flex items-center justify-center bg-gradient-to-r from-gray-400 to-gray-600 ${
                      useCustomColor ? 'ring-2 ring-purple-600 ring-offset-2 scale-105' : 'hover:scale-105'
                    }`}
                    title="Couleur personnalisée"
                  >
                    <span className="text-white text-xs font-bold">PERSO</span>
                  </button>
                </div>
                
                {useCustomColor && (
                  <div className="flex items-center gap-3 mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border-2 border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{customColor}</code>
                        <button
                          onClick={() => copyToClipboard(customColor)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                          title="Copier la couleur"
                        >
                          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Code couleur hexadécimal</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Aperçu du badge - Format 7x9 cm */}
              <div className="flex justify-center mb-6">
                <div 
                  ref={badgeRef}
                  style={{
                    width: '265px',
                    height: '340px',
                    background: currentTheme.bg,
                    borderRadius: '16px',
                    padding: '20px 16px',
                    boxShadow: '0 20px 35px -10px rgba(0,0,0,0.3)',
                    border: `2px solid ${currentTheme.accent}`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Décoration */}
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '100px',
                    height: '100px',
                    background: `radial-gradient(circle, ${currentTheme.accent}20 0%, transparent 70%)`,
                    borderRadius: '50%'
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '80px',
                    height: '80px',
                    background: `radial-gradient(circle, ${currentTheme.accent}20 0%, transparent 70%)`,
                    borderRadius: '50%'
                  }} />
                  
                  {/* Contenu */}
                  <div style={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    position: 'relative', 
                    zIndex: 1 
                  }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                      <div style={{ 
                        fontSize: '15px', 
                        fontWeight: 'bold', 
                        color: currentTheme.accent, 
                        letterSpacing: '1px' 
                      }}>
                        STK 3AFI
                      </div>
                      <div style={{ 
                        fontSize: '8px', 
                        color: currentTheme.accent, 
                        opacity: 0.8, 
                        marginTop: '2px' 
                      }}>
                        ★ ASSOCIATION CHRÉTIENNE ★
                      </div>
                    </div>
                    
                    {/* Photo */}
                    <div style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '50%',
                      background: currentTheme.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                      padding: '2px'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'white'
                      }}>
                        {badgeMember.avatar_url ? (
                          <img 
                            src={badgeMember.avatar_url} 
                            alt={badgeMember.nom} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ 
                              fontSize: '36px', 
                              fontWeight: 'bold', 
                              color: 'white' 
                            }}>
                              {badgeMember.nom.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Nom */}
                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: 'bold',
                      color: 'white',
                      textAlign: 'center',
                      marginBottom: '6px',
                      wordBreak: 'break-word',
                      padding: '0 4px'
                    }}>
                      {badgeMember.nom.toUpperCase()}
                    </h3>
                    
                    {/* Poste */}
                    {badgeMember.poste && (
                      <p style={{
                        fontSize: '9px',
                        color: currentTheme.accent,
                        textAlign: 'center',
                        marginBottom: '10px',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        display: 'inline-block'
                      }}>
                        {badgeMember.poste}
                      </p>
                    )}
                    
                    {/* Séparateur */}
                    <div style={{
                      width: '50%',
                      height: '1px',
                      background: currentTheme.accent,
                      margin: '8px 0'
                    }} />
                    
                    {/* Verset */}
                    <p style={{
                      fontSize: '7.5px',
                      color: 'rgba(255,255,255,0.9)',
                      textAlign: 'center',
                      marginTop: '8px',
                      fontStyle: 'italic',
                      lineHeight: '1.4',
                      padding: '0 10px'
                    }}>
                      "Hihira ho an'i Jehovah aho raha mbola velon'aina koa"
                    </p>
                    
                    {/* Référence */}
                    <p style={{
                      fontSize: '6.5px',
                      color: currentTheme.accent,
                      textAlign: 'center',
                      marginTop: '4px',
                      fontWeight: 'bold'
                    }}>
                      Salamo 104:33
                    </p>
                    
                    {/* Date */}
                    <p style={{
                      fontSize: '6.5px',
                      color: 'rgba(255,255,255,0.5)',
                      textAlign: 'center',
                      marginTop: '8px'
                    }}>
                      Membre depuis {new Date(badgeMember.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadBadge}
                  disabled={downloading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  {downloading ? 'Génération...' : 'Télécharger en PNG'}
                </button>
                <button
                  onClick={() => setShowBadgeModal(false)}
                  className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Fermer
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                Format: 7 x 9 cm (265x340px) - Téléchargement en PNG haute qualité
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
      {isAdding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Ajouter un membre</h2>
                <button onClick={resetForm} className="text-white hover:bg-white/20 rounded-lg p-1 transition">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo de profil</label>
                  <div className="flex items-center space-x-4">
                    {previewUrl && (
                      <div className="relative">
                        <img src={previewUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-purple-500" />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-purple-500 transition">
                        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cliquez pour choisir une image</p>
                        <p className="text-xs text-gray-400">JPG, PNG, GIF, WEBP (max 5MB)</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom complet *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Poste</label>
                  <input
                    type="text"
                    name="poste"
                    value={formData.poste}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Président"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="06 12 34 56 78"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sexe</label>
                  <select
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Non spécifié</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date de naissance</label>
                  <input
                    type="date"
                    name="date_naissance"
                    value={formData.date_naissance}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresse</label>
                  <textarea
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Adresse complète"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {uploading ? 'Enregistrement...' : 'Ajouter le membre'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {isEditing && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Modifier le membre</h2>
                <button onClick={resetForm} className="text-white hover:bg-white/20 rounded-lg p-1 transition">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateMember} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo de profil</label>
                  <div className="flex items-center space-x-4">
                    {previewUrl && (
                      <div className="relative">
                        <img src={previewUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-purple-500" />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(selectedMember.avatar_url);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-purple-500 transition">
                        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Changer la photo</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom complet *</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Poste</label>
                  <input
                    type="text"
                    name="poste"
                    value={formData.poste}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sexe</label>
                  <select
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Non spécifié</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date de naissance</label>
                  <input
                    type="date"
                    name="date_naissance"
                    value={formData.date_naissance}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresse</label>
                  <textarea
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {uploading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
      {viewingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Détails du membre</h2>
                <button onClick={() => setViewingMember(null)} className="text-white hover:bg-white/20 rounded-lg p-1 transition">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                {viewingMember.avatar_url ? (
                  <img 
                    src={viewingMember.avatar_url} 
                    alt={viewingMember.nom} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <span className="text-white text-5xl font-bold">
                      {viewingMember.nom.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mt-4 break-words text-center text-gray-900 dark:text-white">{viewingMember.nom}</h3>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm mt-2 ${getStatusClass(viewingMember.status)}`}>
                  {getStatusIcon(viewingMember.status)}
                  {getStatusText(viewingMember.status)}
                </span>
              </div>

              <div className="space-y-3">
                {viewingMember.poste && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Briefcase className="text-purple-600 flex-shrink-0" size={20} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Poste</p>
                      <p className="font-medium break-words text-gray-900 dark:text-white">{viewingMember.poste}</p>
                    </div>
                  </div>
                )}
                
                {viewingMember.telephone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Phone className="text-purple-600 flex-shrink-0" size={20} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Téléphone</p>
                      <p className="font-medium break-words text-gray-900 dark:text-white">{viewingMember.telephone}</p>
                    </div>
                  </div>
                )}
                
                {viewingMember.sexe && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <User className="text-purple-600 flex-shrink-0" size={20} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Sexe</p>
                      <p className="font-medium break-words text-gray-900 dark:text-white">{getSexeText(viewingMember.sexe)}</p>
                    </div>
                  </div>
                )}
                
                {viewingMember.date_naissance && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Calendar className="text-purple-600 flex-shrink-0" size={20} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Date de naissance</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatDate(viewingMember.date_naissance)}</p>
                    </div>
                  </div>
                )}
                
                {viewingMember.adresse && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <MapPin className="text-purple-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">Adresse</p>
                      <p className="font-medium break-words text-gray-900 dark:text-white">{viewingMember.adresse}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Clock className="text-purple-600 flex-shrink-0" size={20} />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Membre depuis</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDate(viewingMember.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    handleEditMember(viewingMember);
                    setViewingMember(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
                >
                  Modifier
                </button>
                <button
                  onClick={() => {
                    handleDeleteMember(viewingMember.id);
                    setViewingMember(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;