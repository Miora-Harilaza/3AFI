import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  Settings,
  Globe,
  Mail,
  Shield,
  Bell,
  Palette,
  Database,
  Users,
  CreditCard,
  Lock,
  Key,
  Save,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  User,
  Building,
  MapPin,
  Phone,
  AtSign,
  Link,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  Minus,
  Download,
  FileText,
  Calendar,
  Clock,
  Award,
  Star,
  Heart,
  Share2,



  Globe as GlobeIcon,
  MessageSquare,
  Zap,
  TrendingUp,
  BarChart,
  PieChart,
  Activity,
  X
} from 'lucide-react';

interface SettingsType {
  id: string;
  site_name: string;
  site_description: string;
  site_logo: string;
  site_favicon: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_youtube: string;
  social_linkedin: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_verification: boolean;
  dark_mode_default: boolean;
  analytics_id: string;
  updated_at: string;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  new_message_alert: boolean;
  new_user_alert: boolean;
  new_event_alert: boolean;
  daily_summary: boolean;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: false,
    new_message_alert: true,
    new_user_alert: true,
    new_event_alert: true,
    daily_summary: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [backupData, setBackupData] = useState<any>(null);
  const [creatingBackup, setCreatingBackup] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (!currentSession) {
        toast({ 
          title: 'Non authentifié', 
          description: 'Vous devez être connecté pour accéder aux paramètres', 
          variant: 'destructive' 
        });
        return;
      }

      await fetchSettings();
      await fetchNotificationSettings();
    };
    
    initialize();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Fetch error:', error);
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      setSettings(data);
      setLogoPreview(data?.site_logo || '');
      setFaviconPreview(data?.site_favicon || '');
    }
    setLoading(false);
  };

  const fetchNotificationSettings = async () => {
    const { data, error } = await supabase
      .from('admin_notification_settings')
      .select('*')
      .single();

    if (!error && data) {
      setNotificationSettings(data);
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}_${Date.now()}.${fileExt}`;
      const filePath = `settings/${fileName}`;

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

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      let logoUrl = settings.site_logo;
      let faviconUrl = settings.site_favicon;

      if (logoFile) {
        const uploaded = await uploadImage(logoFile, 'logo');
        if (uploaded) logoUrl = uploaded;
      }

      if (faviconFile) {
        const uploaded = await uploadImage(faviconFile, 'favicon');
        if (uploaded) faviconUrl = uploaded;
      }

      const { error } = await supabase
        .from('site_settings')
        .update({
          site_name: settings.site_name,
          site_description: settings.site_description,
          site_logo: logoUrl,
          site_favicon: faviconUrl,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          contact_address: settings.contact_address,
          social_facebook: settings.social_facebook,
          social_twitter: settings.social_twitter,
          social_instagram: settings.social_instagram,
          social_youtube: settings.social_youtube,
          social_linkedin: settings.social_linkedin,
          maintenance_mode: settings.maintenance_mode,
          registration_enabled: settings.registration_enabled,
          email_verification: settings.email_verification,
          dark_mode_default: settings.dark_mode_default,
          analytics_id: settings.analytics_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      // Sauvegarder les notifications
      await supabase
        .from('admin_notification_settings')
        .upsert({
          ...notificationSettings,
          updated_at: new Date().toISOString()
        });

      toast({ title: 'Succès', description: 'Paramètres sauvegardés' });
      setLogoFile(null);
      setFaviconFile(null);
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

  const createBackup = async () => {
    setCreatingBackup(true);
    try {
      // Récupérer toutes les données importantes
      const tables = ['users', 'evenement', 'contact_messages', 'inscriptions'];
      const backup: any = {};

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (!error && data) {
          backup[table] = data;
        }
      }

      // Créer un fichier JSON
      const backupJson = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: 'Succès', description: 'Sauvegarde créée avec succès' });
    } catch (err: any) {
      console.error('Backup error:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Erreur', description: 'Veuillez sélectionner une image', variant: 'destructive' });
        return;
      }
      if (file.size > 500 * 1024) {
        toast({ title: 'Erreur', description: 'Le favicon ne doit pas dépasser 500KB', variant: 'destructive' });
        return;
      }
      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Authentification requise</h2>
          <p className="text-gray-600">Vous devez être connecté pour accéder aux paramètres.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: Settings },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'social', label: 'Réseaux sociaux', icon: Share2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'backup', label: 'Sauvegarde', icon: Database },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
        <p className="text-gray-500">Chargement des paramètres...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Paramètres
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gérez la configuration de votre site</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          {/* Général */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du site *
                  </label>
                  <input
                    type="text"
                    value={settings?.site_name || ''}
                    onChange={(e) => setSettings({ ...settings!, site_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom de votre site"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Google Analytics
                  </label>
                  <input
                    type="text"
                    value={settings?.analytics_id || ''}
                    onChange={(e) => setSettings({ ...settings!, analytics_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="G-XXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du site
                </label>
                <textarea
                  value={settings?.site_description || ''}
                  onChange={(e) => setSettings({ ...settings!, site_description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description de votre site"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Options du site</h3>
                <div className="space-y-3">
                  <ToggleSwitch
                    label="Mode maintenance"
                    description="Activer le mode maintenance pour les visiteurs"
                    enabled={settings?.maintenance_mode || false}
                    onChange={() => setSettings({ ...settings!, maintenance_mode: !settings?.maintenance_mode })}
                  />
                  <ToggleSwitch
                    label="Inscriptions ouvertes"
                    description="Permettre aux nouveaux utilisateurs de s'inscrire"
                    enabled={settings?.registration_enabled || false}
                    onChange={() => setSettings({ ...settings!, registration_enabled: !settings?.registration_enabled })}
                  />
                  <ToggleSwitch
                    label="Vérification email"
                    description="Exiger la vérification de l'email lors de l'inscription"
                    enabled={settings?.email_verification || false}
                    onChange={() => setSettings({ ...settings!, email_verification: !settings?.email_verification })}
                  />
                  <ToggleSwitch
                    label="Mode sombre par défaut"
                    description="Utiliser le mode sombre comme thème par défaut"
                    enabled={settings?.dark_mode_default || false}
                    onChange={() => setSettings({ ...settings!, dark_mode_default: !settings?.dark_mode_default })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Apparence */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo du site</label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="relative">
                      <img src={logoPreview} alt="Logo" className="w-20 h-20 object-contain rounded-lg border" />
                      <button
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(settings?.site_logo || '');
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Changer le logo</span>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Format recommandé: PNG, 256x256px, max 2MB</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                <div className="flex items-center gap-4">
                  {faviconPreview && (
                    <div className="relative">
                      <img src={faviconPreview} alt="Favicon" className="w-10 h-10 object-contain" />
                      <button
                        onClick={() => {
                          setFaviconFile(null);
                          setFaviconPreview(settings?.site_favicon || '');
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Changer le favicon</span>
                    <input type="file" accept="image/*" onChange={handleFaviconChange} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">Format: ICO, PNG, 32x32px ou 64x64px, max 500KB</p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Couleurs personnalisées</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ColorPicker label="Couleur primaire" color="#3B82F6" />
                  <ColorPicker label="Couleur secondaire" color="#8B5CF6" />
                </div>
              </div>
            </div>
          )}

          {/* Contact */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contact *
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={settings?.contact_email || ''}
                      onChange={(e) => setSettings({ ...settings!, contact_email: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@exemple.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={settings?.contact_phone || ''}
                      onChange={(e) => setSettings({ ...settings!, contact_phone: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    value={settings?.contact_address || ''}
                    onChange={(e) => setSettings({ ...settings!, contact_address: e.target.value })}
                    rows={3}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre adresse complète"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Réseaux sociaux */}
       

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <ToggleSwitch
                  label="Notifications email"
                  description="Recevoir des notifications par email"
                  enabled={notificationSettings.email_notifications}
                  onChange={() => setNotificationSettings({ ...notificationSettings, email_notifications: !notificationSettings.email_notifications })}
                />
                <ToggleSwitch
                  label="Notifications push"
                  description="Recevoir des notifications push dans le navigateur"
                  enabled={notificationSettings.push_notifications}
                  onChange={() => setNotificationSettings({ ...notificationSettings, push_notifications: !notificationSettings.push_notifications })}
                />
                <ToggleSwitch
                  label="Alerte nouveaux messages"
                  description="Être alerté lors de la réception d'un nouveau message"
                  enabled={notificationSettings.new_message_alert}
                  onChange={() => setNotificationSettings({ ...notificationSettings, new_message_alert: !notificationSettings.new_message_alert })}
                />
                <ToggleSwitch
                  label="Alerte nouveaux utilisateurs"
                  description="Être alerté lors de l'inscription d'un nouvel utilisateur"
                  enabled={notificationSettings.new_user_alert}
                  onChange={() => setNotificationSettings({ ...notificationSettings, new_user_alert: !notificationSettings.new_user_alert })}
                />
                <ToggleSwitch
                  label="Alerte nouveaux événements"
                  description="Être alerté lors de la création d'un nouvel événement"
                  enabled={notificationSettings.new_event_alert}
                  onChange={() => setNotificationSettings({ ...notificationSettings, new_event_alert: !notificationSettings.new_event_alert })}
                />
                <ToggleSwitch
                  label="Résumé quotidien"
                  description="Recevoir un résumé quotidien de l'activité"
                  enabled={notificationSettings.daily_summary}
                  onChange={() => setNotificationSettings({ ...notificationSettings, daily_summary: !notificationSettings.daily_summary })}
                />
              </div>
            </div>
          )}

          {/* Sécurité */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Changer le mot de passe</h3>
                </div>
                <p className="text-sm text-blue-600 mb-4">Pour des raisons de sécurité, choisissez un mot de passe fort</p>
                
                <div className="space-y-4">
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
                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword || !passwordData.new_password}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    {changingPassword ? 'Modification...' : 'Changer le mot de passe'}
                  </button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sessions actives</h3>
                <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
                  <p>Aucune autre session active</p>
                </div>
              </div>
            </div>
          )}

          {/* Sauvegarde */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 text-center">
                <Database className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Sauvegarde des données</h3>
                <p className="text-gray-600 mb-4">
                  Exportez toutes vos données (utilisateurs, événements, messages) au format JSON
                </p>
                <button
                  onClick={createBackup}
                  disabled={creatingBackup}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {creatingBackup ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {creatingBackup ? 'Création...' : 'Créer une sauvegarde'}
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations système</h3>
                <div className="space-y-2">
                  <InfoRow label="Version" value="1.0.0" />
                  <InfoRow label="Base de données" value="PostgreSQL" />
                  <InfoRow label="Dernière mise à jour" value={new Date(settings?.updated_at || '').toLocaleString('fr-FR')} />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t mt-6">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composants réutilisables
const ToggleSwitch = ({ label, description, enabled, onChange }: any) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const SocialInput = ({ icon: Icon, label, value, onChange, placeholder }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {label}
      </div>
    </label>
    <input
      type="url"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
    />
  </div>
);

const ColorPicker = ({ label, color }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: color }} />
      <input type="color" value={color} className="w-full px-4 py-2 border border-gray-200 rounded-xl" />
    </div>
  </div>
);

const InfoRow = ({ label, value }: any) => (
  <div className="flex justify-between py-2 border-b border-gray-100">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

export default AdminSettings;