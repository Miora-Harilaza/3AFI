import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Key,
  Save,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  LogOut,
  Activity,
  Smartphone,
  Globe,
  Award,
  Star,
  Heart,
  Users,
  MessageSquare,
  Calendar as CalendarIcon,
  Settings,
  Bell,
  Lock,
  Fingerprint,
  RefreshCw,
  ChevronRight,
  Edit2,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  ExternalLink,

} from 'lucide-react';

interface AdminProfile {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  avatar_url: string;
  role: string;
  telephone: string;
  adresse: string;
  ville: string;
  code_postal: string;
  pays: string;
  bio: string;
  site_web: string;
  github: string;
  twitter: string;
  linkedin: string;
  facebook: string;
  created_at: string;
  updated_at: string;
  last_login: string;
  deux_facteur: boolean;
  notifications_email: boolean;
  notifications_push: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const AdminProfile = () => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [showActivities, setShowActivities] = useState(false);
  const [stats, setStats] = useState({
    total_messages: 0,
    total_events: 0,
    total_users: 0,
    login_streak: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (!currentSession) {
        toast({ 
          title: 'Non authentifié', 
          description: 'Vous devez être connecté pour accéder à votre profil', 
          variant: 'destructive' 
        });
        return;
      }

      await fetchProfile();
      await fetchActivities();
      await fetchStats();
    };
    
    initialize();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setAvatarPreview(data?.avatar_url || '');
    } catch (err: any) {
      console.error('Fetch profile error:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setActivities(data);
      }
    } catch (err) {
      console.error('Fetch activities error:', err);
    }
  };

  const fetchStats = async () => {
    try {
      // Récupérer les stats
      const [messagesRes, eventsRes, usersRes] = await Promise.all([
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('evenement').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        total_messages: messagesRes.count || 0,
        total_events: eventsRes.count || 0,
        total_users: usersRes.count || 0,
        login_streak: Math.floor(Math.random() * 30) + 1 // Simulé
      });
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${profile?.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;

      if (avatarFile) {
        const uploaded = await uploadAvatar(avatarFile);
        if (uploaded) avatarUrl = uploaded;
      }

      const { error } = await supabase
        .from('users')
        .update({
          nom: profile.nom,
          prenom: profile.prenom,
          telephone: profile.telephone,
          adresse: profile.adresse,
          ville: profile.ville,
          code_postal: profile.code_postal,
          pays: profile.pays,
          bio: profile.bio,
          site_web: profile.site_web,
          github: profile.github,
          twitter: profile.twitter,
          linkedin: profile.linkedin,
          facebook: profile.facebook,
          avatar_url: avatarUrl,
          notifications_email: profile.notifications_email,
          notifications_push: profile.notifications_push,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({ title: 'Succès', description: 'Profil mis à jour avec succès' });
      setIsEditing(false);
      setAvatarFile(null);
      await fetchProfile();
    } catch (err: any) {
      console.error('Save error:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit contenir au moins 6 caractères', variant: 'destructive' });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      });

      if (error) throw error;

      toast({ title: 'Succès', description: 'Mot de passe modifié avec succès' });
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err: any) {
      console.error('Password change error:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Erreur', description: 'Veuillez sélectionner une image', variant: 'destructive' });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'Erreur', description: 'L\'image ne doit pas dépasser 2MB', variant: 'destructive' });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Jamais';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getRoleBadge = (role: string) => {
    const config = {
      admin: { label: 'Administrateur', className: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' },
      super_admin: { label: 'Super Administrateur', className: 'bg-gradient-to-r from-red-600 to-orange-600 text-white' },
      moderator: { label: 'Modérateur', className: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' }
    };
    const conf = config[role as keyof typeof config] || config.admin;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${conf.className}`}>{conf.label}</span>;
  };

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Authentification requise</h2>
          <p className="text-gray-600">Vous devez être connecté pour accéder à votre profil.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
        <p className="text-gray-500">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header avec cover */}
      <div className="relative">
        <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-b-2xl" />
        <div className="absolute -bottom-16 left-4 sm:left-8">
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white p-1 shadow-xl">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={profile?.prenom}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {profile?.prenom?.charAt(0).toUpperCase()}{profile?.nom?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition">
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {/* En-tête du profil */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {profile?.prenom} {profile?.nom}
              </h1>
              {getRoleBadge(profile?.role || 'admin')}
            </div>
            <div className="flex items-center gap-2 mt-1 text-gray-500">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{profile?.email}</span>
            </div>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Modifier le profil
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                    setAvatarFile(null);
                    setAvatarPreview(profile?.avatar_url || '');
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCardSmall
            title="Messages"
            value={stats.total_messages}
            icon={MessageSquare}
            color="blue"
          />
          <StatCardSmall
            title="Événements"
            value={stats.total_events}
            icon={CalendarIcon}
            color="green"
          />
          <StatCardSmall
            title="Utilisateurs"
            value={stats.total_users}
            icon={Users}
            color="purple"
          />
          <StatCardSmall
            title="Jours actifs"
            value={stats.login_streak}
            icon={Activity}
            color="orange"
          />
        </div>

        {/* Grille principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Informations personnelles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Informations personnelles
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField
                  label="Nom"
                  value={profile?.nom}
                  isEditing={isEditing}
                  onChange={(value) => setProfile({ ...profile!, nom: value })}
                  icon={User}
                />
                <InfoField
                  label="Prénom"
                  value={profile?.prenom}
                  isEditing={isEditing}
                  onChange={(value) => setProfile({ ...profile!, prenom: value })}
                  icon={User}
                />
                <InfoField
                  label="Email"
                  value={profile?.email}
                  isEditing={false}
                  icon={Mail}
                  readonly
                />
                <InfoField
                  label="Téléphone"
                  value={profile?.telephone}
                  isEditing={isEditing}
                  onChange={(value) => setProfile({ ...profile!, telephone: value })}
                  icon={Phone}
                  placeholder="+33 6 12 34 56 78"
                />
                <InfoField
                  label="Adresse"
                  value={profile?.adresse}
                  isEditing={isEditing}
                  onChange={(value) => setProfile({ ...profile!, adresse: value })}
                  icon={MapPin}
                  placeholder="Numéro et rue"
                />
                <InfoField
                  label="Ville"
                  value={profile?.ville}
                  isEditing={isEditing}
                  onChange={(value) => setProfile({ ...profile!, ville: value })}
                  icon={MapPin}
                />
                <InfoField
                  label="Code postal"
                  value={profile?.code_postal}
                  isEditing={isEditing}
                  onChange={(value) => setProfile({ ...profile!, code_postal: value })}
                  icon={MapPin}
                />
                <InfoField
                  label="Pays"
                  value={profile?.pays}
                  isEditing={isEditing}
                  onChange={(value) => setProfile({ ...profile!, pays: value })}
                  icon={Globe}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {isEditing ? (
                  <textarea
                    value={profile?.bio || ''}
                    onChange={(e) => setProfile({ ...profile!, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Parlez-nous un peu de vous..."
                  />
                ) : (
                  <p className="text-gray-600 text-sm">{profile?.bio || 'Aucune bio renseignée'}</p>
                )}
              </div>
            </div>

            {/* Liens sociaux */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Liens et réseaux sociaux
              </h3>
          
            </div>
          </div>

          {/* Colonne de droite */}
          <div className="space-y-6">
            {/* Informations du compte */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Informations du compte
              </h3>
              
              <div className="space-y-3">
                <InfoRow
                  label="Membre depuis"
                  value={formatDate(profile?.created_at || '')}
                  icon={Calendar}
                />
                <InfoRow
                  label="Dernière connexion"
                  value={formatDate(profile?.last_login || '')}
                  icon={Clock}
                />
                <InfoRow
                  label="Rôle"
                  value={getRoleBadge(profile?.role || 'admin')}
                  icon={Shield}
                  isHtml
                />
              </div>

              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm"
                >
                  <Key className="w-4 h-4" />
                  Changer le mot de passe
                </button>
              </div>
            </div>

            {/* Préférences de notification */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Préférences
              </h3>
              
              <div className="space-y-3">
                <ToggleSwitch
                  label="Notifications email"
                  enabled={profile?.notifications_email || false}
                  onChange={() => setProfile({ ...profile!, notifications_email: !profile?.notifications_email })}
                  disabled={!isEditing}
                />
                <ToggleSwitch
                  label="Notifications push"
                  enabled={profile?.notifications_push || false}
                  onChange={() => setProfile({ ...profile!, notifications_push: !profile?.notifications_push })}
                  disabled={!isEditing}
                />
                <ToggleSwitch
                  label="Authentification à deux facteurs"
                  enabled={profile?.deux_facteur || false}
                  onChange={() => setProfile({ ...profile!, deux_facteur: !profile?.deux_facteur })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Activités récentes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Activités récentes
                </h3>
                <button
                  onClick={() => setShowActivities(!showActivities)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  {showActivities ? 'Voir moins' : 'Voir tout'}
                </button>
              </div>
              
              <div className="space-y-3">
                {activities.slice(0, showActivities ? 10 : 3).map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
                {activities.length === 0 && (
                  <p className="text-center text-gray-500 text-sm py-4">Aucune activité récente</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Changer le mot de passe</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                  });
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirmer le mot de passe"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      current_password: '',
                      new_password: '',
                      confirm_password: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !passwordData.new_password}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  {changingPassword ? 'Modification...' : 'Changer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composants réutilisables
const StatCardSmall = ({ title, value, icon: Icon, color }: any) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };
  
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-medium">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </div>
  );
};

const InfoField = ({ label, value, isEditing, onChange, icon: Icon, placeholder, readonly }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {isEditing && !readonly ? (
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${Icon ? 'pl-9' : 'px-4'} py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
          placeholder={placeholder}
        />
      </div>
    ) : (
      <p className="text-gray-800 text-sm">{value || 'Non renseigné'}</p>
    )}
  </div>
);

const SocialField = ({ label, value, isEditing, onChange, icon: Icon, placeholder }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {isEditing ? (
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder={placeholder}
        />
      </div>
    ) : value ? (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2"
      >
        <Icon className="w-4 h-4" />
        {value}
        <ExternalLink className="w-3 h-3" />
      </a>
    ) : (
      <p className="text-gray-400 text-sm">Non renseigné</p>
    )}
  </div>
);

const InfoRow = ({ label, value, icon: Icon, isHtml }: any) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <div className="text-sm font-medium text-gray-800">
      {isHtml ? value : value}
    </div>
  </div>
);

const ToggleSwitch = ({ label, enabled, onChange, disabled }: any) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-gray-700">{label}</span>
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const ActivityItem = ({ activity }: any) => {
  const getActivityIcon = (action: string) => {
    if (action.includes('login')) return <LogOut className="w-3 h-3" />;
    if (action.includes('create')) return <CheckCircle className="w-3 h-3" />;
    if (action.includes('delete')) return <Trash2 className="w-3 h-3" />;
    if (action.includes('update')) return <Edit2 className="w-3 h-3" />;
    return <Activity className="w-3 h-3" />;
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'À l\'instant';
    if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    return d.toLocaleDateString('fr-FR');
  };

  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        {getActivityIcon(activity.action)}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800">{activity.details}</p>
        <p className="text-xs text-gray-400">{formatTime(activity.created_at)}</p>
      </div>
    </div>
  );
};

export default AdminProfile;