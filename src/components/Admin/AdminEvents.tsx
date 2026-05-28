import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  X, Plus, Trash2, Eye, Edit, Calendar, Clock, MapPin, 
  Users, Tag, Image as ImageIcon, Upload, Loader2,
  AlertCircle, ChevronDown, ChevronUp, Search, Filter, AlertTriangle,
  Zap, Star, Award, TrendingUp, RefreshCw, CheckCircle, XCircle,
  Printer, Image as ImageIcon2, Download
} from 'lucide-react';
import { toPng, toJpeg, toBlob } from 'html-to-image';

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
  created_by: string;
  created_at: string;
  updated_at: string;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [session, setSession] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [editCategoryInput, setEditCategoryInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  const tableRef = useRef<HTMLDivElement>(null);
  
  const [newEvent, setNewEvent] = useState({
    titre: '',
    date: '',
    heure: '',
    categories: [] as string[],
    place: '',
    description: '',
    image_file: null as File | null,
    image_preview: '',
    capacite_max: 0,
    places_disponibles: 0,
    status: 'a_venir' as const
  });
  
  const { toast } = useToast();

  // Vérifier si une date est dépassée
  const isDatePassed = (date: string, time?: string): boolean => {
    const eventDateTime = time 
      ? new Date(`${date}T${time}`)
      : new Date(`${date}T23:59:59`);
    const now = new Date();
    return eventDateTime < now;
  };

  // Fonction pour échapper le HTML
  const escapeHtml = (text: string) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Fonction d'export en PNG/JPEG
// Fonction d'export en PNG/JPEG optimisée pour les galeries de téléphone
const exportAsImage = async () => {
  if (!tableRef.current) {
    toast({ 
      title: 'Erreur', 
      description: 'Impossible de trouver le tableau à exporter', 
      variant: 'destructive' 
    });
    return;
  }

  setExporting(true);
  
  try {
    // Créer un élément temporaire pour l'export avec des dimensions optimisées pour mobile
    const exportElement = document.createElement('div');
    exportElement.style.backgroundColor = 'white';
    exportElement.style.padding = '30px';
    exportElement.style.borderRadius = '12px';
    exportElement.style.width = '1000px'; // Largeur optimisée pour mobile
    exportElement.style.maxWidth = '100%';
    exportElement.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    
    // Générer le contenu HTML pour l'export
    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const getStatusLabel = (status: string) => {
      const statusMap: Record<string, string> = {
        a_venir: 'À venir',
        en_cours: 'En cours',
        termine: 'Terminé',
        annule: 'Annulé'
      };
      return statusMap[status] || status;
    };

    const filterInfo = [];
    if (searchTerm) filterInfo.push(`Recherche: "${searchTerm}"`);
    if (filterStatus !== 'all') filterInfo.push(`Statut: ${getStatusLabel(filterStatus)}`);
    if (filterCategory !== 'all') filterInfo.push(`Catégorie: ${filterCategory}`);

    // Calculer le nombre total de pages pour l'aperçu
    const eventsPerPage = 20;
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    const currentPageEvents = filteredEvents;

    exportElement.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <!-- En-tête -->
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #e5e7eb;">
          <div style="font-size: 48px; margin-bottom: 10px;">📅</div>
          <h1 style="font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 10px; margin: 0 0 10px 0;">
          STK ANTSO MA FI
          </h1>
          <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">
            TETI-ANDRO 2026 
          </div>
          <div style="color: #9ca3af; font-size: 12px;">
            Généré le ${formattedDate} à ${formattedTime}
          </div>
        </div>
        
        <!-- Filtres -->
        ${filterInfo.length > 0 ? `
          <div style="background: #f3f4f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #374151;">
            <strong>🔍 Filtres appliqués :</strong> ${filterInfo.join(' • ')}
          </div>
        ` : ''}
        
        <!-- Statistiques -->
        <div style="display: flex; gap: 15px; margin-bottom: 25px; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; font-size: 14px; flex-wrap: wrap; color: white;">
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 24px; font-weight: bold;">${filteredEvents.length}</div>
            <div style="font-size: 12px; opacity: 0.9;">Total</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 24px; font-weight: bold;">${filteredEvents.filter(e => e.status === 'a_venir').length}</div>
            <div style="font-size: 12px; opacity: 0.9;">À venir</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 24px; font-weight: bold;">${filteredEvents.filter(e => e.status === 'en_cours').length}</div>
            <div style="font-size: 12px; opacity: 0.9;">En cours</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 24px; font-weight: bold;">${filteredEvents.filter(e => e.status === 'termine').length}</div>
            <div style="font-size: 12px; opacity: 0.9;">Terminés</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 24px; font-weight: bold;">${filteredEvents.filter(e => e.status === 'annule').length}</div>
            <div style="font-size: 12px; opacity: 0.9;">Annulés</div>
          </div>
        </div>
        
        ${currentPageEvents.length > 0 ? `
          <!-- Tableau des événements -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 13px; border-radius: 8px 0 0 0;">#</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 13px;">Événement</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 13px;">Date</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 13px;">Heure</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 13px;">Lieu</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 13px;">Statut</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; font-size: 13px;">Places</th>
              </tr>
            </thead>
            <tbody>
              ${currentPageEvents.map((event, index) => `
                <tr style="border-bottom: 1px solid #e5e7eb; ${index % 2 === 0 ? 'background-color: #f9fafb;' : ''}">
                  <td style="padding: 12px; font-size: 13px; color: #4b5563;">${index + 1}</td>
                  <td style="padding: 12px; font-size: 13px; color: #4b5563;">
                    <strong>${escapeHtml(event.titre)}</strong>
                    ${event.categories && event.categories.length > 0 ? `
                      <div style="margin-top: 4px;">
                        ${event.categories.slice(0, 2).map(cat => `
                          <span style="display: inline-block; padding: 2px 6px; background: #e5e7eb; border-radius: 4px; font-size: 10px; margin-right: 4px;">${escapeHtml(cat)}</span>
                        `).join('')}
                        ${event.categories.length > 2 ? `<span style="display: inline-block; padding: 2px 6px; background: #e5e7eb; border-radius: 4px; font-size: 10px;">+${event.categories.length - 2}</span>` : ''}
                      </div>
                    ` : ''}
                  </td>
                  <td style="padding: 12px; font-size: 13px; color: #4b5563;">
                    ${new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style="padding: 12px; font-size: 13px; color: #4b5563;">
                    ${event.heure ? event.heure.substring(0, 5) : '-'}
                  </td>
                  <td style="padding: 12px; font-size: 13px; color: #4b5563;">
                    ${escapeHtml(event.place || '-')}
                  </td>
                  <td style="padding: 12px;">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; background: ${
                      event.status === 'a_venir' ? '#dbeafe' :
                      event.status === 'en_cours' ? '#dcfce7' :
                      event.status === 'termine' ? '#f3f4f6' : '#fee2e2'
                    }; color: ${
                      event.status === 'a_venir' ? '#1e40af' :
                      event.status === 'en_cours' ? '#166534' :
                      event.status === 'termine' ? '#374151' : '#991b1b'
                    };">
                      ${getStatusLabel(event.status)}
                    </span>
                  </td>
                  <td style="padding: 12px; font-size: 13px; color: #4b5563;">
                    ${event.capacite_max > 0 ? `${event.places_disponibles}/${event.capacite_max}` : '∞'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Pied de page -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af;">
            <p>Document généré automatiquement - ${filteredEvents.length} événement(s) affiché(s)</p>
            <p style="margin-top: 5px;">Espace administratif - Tous droits réservés</p>
            <p style="margin-top: 5px;">Généré le ${formattedDate} à ${formattedTime}</p>
          </div>
        ` : `
          <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
            <div style="font-size: 48px; margin-bottom: 20px;">📭</div>
            <p style="font-size: 16px; margin-bottom: 10px;">Aucun événement trouvé</p>
            <p style="font-size: 14px;">Essayez de modifier vos filtres pour afficher plus de résultats.</p>
          </div>
        `}
      </div>
    `;

    document.body.appendChild(exportElement);
    
    // Configuration optimisée pour les galeries de téléphone
    const options = {
      quality: 0.95, // Haute qualité
      pixelRatio: 3, // Haute résolution pour les écrans Retina
      backgroundColor: '#ffffff',
      cacheBust: true,
      includeQueryParams: true,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }
    };
    
    let dataUrl;
    if (exportFormat === 'png') {
      dataUrl = await toPng(exportElement, options);
    } else {
      dataUrl = await toJpeg(exportElement, { ...options, quality: 0.92 });
    }
    
    // Télécharger l'image avec un nom compatible mobile
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `evenements_${timestamp}.${exportFormat}`;
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    
    // Pour les mobiles, essayer de partager l'image si l'API Share est disponible
    if (navigator.share && exportFormat === 'png') {
      // Convertir dataUrl en blob pour le partage
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: `image/${exportFormat}` });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Liste des événements',
            text: `Export du ${formattedDate}`,
            files: [file]
          });
        } catch (shareError) {
          console.log('Partage annulé ou erreur:', shareError);
        }
      }
    }
    
    // Nettoyer
    document.body.removeChild(exportElement);
    
    toast({ 
      title: '✅ Export réussi', 
      description: `L'image a été sauvegardée dans votre galerie (${exportFormat.toUpperCase()})` 
    });
  } catch (error) {
    console.error('Export error:', error);
    toast({ 
      title: '❌ Erreur', 
      description: 'Une erreur est survenue lors de l\'export. Réessayez.', 
      variant: 'destructive' 
    });
  } finally {
    setExporting(false);
    // Fermer le menu
    document.getElementById('export-menu')?.classList.add('hidden');
  }
};

  // Fonction d'impression
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const getStatusLabel = (status: string) => {
      const statusMap: Record<string, string> = {
        a_venir: 'À venir',
        en_cours: 'En cours',
        termine: 'Terminé',
        annule: 'Annulé'
      };
      return statusMap[status] || status;
    };

    const filterInfo = [];
    if (searchTerm) filterInfo.push(`Recherche: "${searchTerm}"`);
    if (filterStatus !== 'all') filterInfo.push(`Statut: ${getStatusLabel(filterStatus)}`);
    if (filterCategory !== 'all') filterInfo.push(`Catégorie: ${filterCategory}`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Liste des événements - ${formattedDate}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, Helvetica, sans-serif; padding: 20px; background: white; }
          @media print {
            body { padding: 0; margin: 0; }
            .no-print { display: none; }
            table { page-break-inside: avoid; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
          }
          .print-container { max-width: 1200px; margin: 0 auto; background: white; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
          .header h1 { font-size: 24px; color: #1f2937; margin-bottom: 8px; }
          .header .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 5px; }
          .header .date { color: #9ca3af; font-size: 12px; }
          .filters-info { background: #f3f4f6; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #374151; }
          .filters-info strong { color: #1f2937; }
          .stats { display: flex; gap: 20px; margin-bottom: 20px; padding: 12px 16px; background: #eff6ff; border-radius: 8px; font-size: 14px; flex-wrap: wrap; }
          .stats span { font-weight: bold; color: #2563eb; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #f9fafb; padding: 12px; text-align: left; font-weight: 600; font-size: 13px; color: #374151; border-bottom: 2px solid #e5e7eb; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #4b5563; }
          .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
          .status-a_venir { background: #dbeafe; color: #1e40af; }
          .status-en_cours { background: #dcfce7; color: #166534; }
          .status-termine { background: #f3f4f6; color: #374151; }
          .status-annule { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
          .no-data { text-align: center; padding: 40px; color: #6b7280; font-size: 14px; }
          @page { size: A4; margin: 2cm; }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <h1>📅STK ANTSOMAFI</h1>
            <div class="subtitle">TETI-ANDRO 2026</div>
            <div class="date">Généré le ${formattedDate} à ${formattedTime}</div>
          </div>
          
          ${filterInfo.length > 0 ? `
            <div class="filters-info">
              <strong>🔍 Filtres appliqués :</strong> ${filterInfo.join(' • ')}
            </div>
          ` : ''}
          
          <div class="stats">
            <div>📊 Total des événements : <span>${filteredEvents.length}</span></div>
            <div>✅ À venir : <span>${filteredEvents.filter(e => e.status === 'a_venir').length}</span></div>
            <div>🟢 En cours : <span>${filteredEvents.filter(e => e.status === 'en_cours').length}</span></div>
            <div>✔️ Terminés : <span>${filteredEvents.filter(e => e.status === 'termine').length}</span></div>
            <div>❌ Annulés : <span>${filteredEvents.filter(e => e.status === 'annule').length}</span></div>
          </div>
          
          ${filteredEvents.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nom de l'événement</th>
                  <th>Date</th>
                  <th>Heure</th>
                  <th>Lieu</th>
                  <th>Statut</th>
                  <th>Catégories</th>
                  <th>Places</th>
                </tr>
              </thead>
              <tbody>
                ${filteredEvents.map((event, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td><strong>${escapeHtml(event.titre)}</strong></td>
                    <td>${new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>${event.heure ? event.heure.substring(0, 5) : '-'}</td>
                    <td>${escapeHtml(event.place || '-')}</td>
                    <td><span class="status-badge status-${event.status}">${getStatusLabel(event.status)}</span></td>
                    <td>${event.categories && event.categories.length > 0 ? event.categories.slice(0, 3).join(', ') + (event.categories.length > 3 ? '...' : '') : '-'}</td>
                    <td>${event.capacite_max > 0 ? `${event.places_disponibles}/${event.capacite_max}` : 'Illimité'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="footer">
              <p>Document généré automatiquement - ${filteredEvents.length} événement(s) affiché(s)</p>
              <p>Espace administratif - Tous droits réservés</p>
            </div>
          ` : `
            <div class="no-data">
              <p>Aucun événement ne correspond aux critères de recherche.</p>
              <p style="margin-top: 10px; font-size: 12px;">Essayez de modifier vos filtres pour afficher plus de résultats.</p>
            </div>
          `}
        </div>
        
        <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
          <button onclick="window.print();" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;">
            🖨️ Imprimer
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  useEffect(() => {
    const initialize = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (!currentSession) {
        toast({ 
          title: 'Non authentifié', 
          description: 'Vous devez être connecté pour gérer les événements', 
          variant: 'destructive' 
        });
        return;
      }

      await fetchEvents();
    };
    
    initialize();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      extractCategories();
      checkAndUpdateExpiredEvents();
    }
  }, [events]);

  const checkAndUpdateExpiredEvents = async () => {
    const expiredEvents = events.filter(event => {
      if (event.status === 'termine' || event.status === 'annule') return false;
      return isDatePassed(event.date, event.heure);
    });

    for (const event of expiredEvents) {
      if (event.status !== 'termine') {
        await supabase
          .from('evenement')
          .update({ status: 'termine', updated_at: new Date().toISOString() })
          .eq('id', event.id);
      }
    }

    if (expiredEvents.length > 0) {
      await fetchEvents();
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('evenement')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Fetch error:', error);
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
    toast({ title: 'Actualisé', description: 'Les données ont été actualisées' });
  };

  const extractCategories = () => {
    const allCategories = events.flatMap(event => event.categories || []);
    const uniqueCategories = [...new Set(allCategories)];
    setCategories(uniqueCategories);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `event_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `evenements/${fileName}`;

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
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageUrl: string) => {
    if (!imageUrl) return;
    
    try {
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('avatars') + 1).join('/');
      
      if (filePath) {
        await supabase.storage
          .from('avatars')
          .remove([filePath]);
      }
    } catch (error) {
      console.error('Delete image error:', error);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const finalStatus = isDatePassed(newEvent.date, newEvent.heure) ? 'termine' : newEvent.status;
      
      if (isDatePassed(newEvent.date, newEvent.heure)) {
        toast({
          title: 'Attention',
          description: "La date est dépassée, l'événement a été automatiquement marqué comme 'Terminé'.",
          variant: 'destructive',
        });
      }
      
      let imageUrl = null;
      if (newEvent.image_file) {
        imageUrl = await uploadImage(newEvent.image_file);
        if (!imageUrl) return;
      }
      
      const { error } = await supabase
        .from('evenement')
        .insert([{
          titre: newEvent.titre,
          date: newEvent.date,
          heure: newEvent.heure || null,
          categories: newEvent.categories,
          place: newEvent.place || null,
          description: newEvent.description || null,
          image_url: imageUrl,
          capacite_max: newEvent.capacite_max,
          places_disponibles: newEvent.places_disponibles,
          status: finalStatus,
          created_by: userData.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({ title: 'Succès', description: 'Événement ajouté avec succès' });
      setShowAddModal(false);
      resetNewEventForm();
      fetchEvents();
    } catch (err: any) {
      console.error('Add event error:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const resetNewEventForm = () => {
    setNewEvent({
      titre: '',
      date: '',
      heure: '',
      categories: [],
      place: '',
      description: '',
      image_file: null,
      image_preview: '',
      capacite_max: 0,
      places_disponibles: 0,
      status: 'a_venir'
    });
    setNewCategoryInput('');
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      if (selectedEvent.image_url) {
        await deleteImage(selectedEvent.image_url);
      }

      const { error } = await supabase
        .from('evenement')
        .delete()
        .eq('id', selectedEvent.id);

      if (error) throw error;

      toast({ title: 'Succès', description: 'Événement supprimé avec succès' });
      setShowDeleteModal(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err: any) {
      console.error('Delete error:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateStatus = async (event: Event, newStatus: string) => {
    if (newStatus === 'a_venir' && isDatePassed(event.date, event.heure)) {
      toast({ 
        title: 'Action impossible', 
        description: "Impossible de marquer comme 'À venir' un événement dont la date est déjà dépassée.", 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('evenement')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', event.id);

      if (error) throw error;

      toast({ title: 'Succès', description: `Statut mis à jour: ${newStatus}` });
      fetchEvents();
    } catch (err: any) {
      console.error('Update status error:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateEvent = async (eventData: any) => {
    if (!editingEvent) return;

    try {
      let updateData: any = {
        titre: eventData.titre,
        date: eventData.date,
        heure: eventData.heure,
        place: eventData.place,
        description: eventData.description,
        categories: editCategories,
        capacite_max: eventData.capacite_max,
        places_disponibles: eventData.places_disponibles,
        updated_at: new Date().toISOString()
      };

      if (eventData.date && isDatePassed(eventData.date, eventData.heure)) {
        updateData.status = 'termine';
      } else {
        updateData.status = eventData.status || editingEvent.status;
      }

      if (eventData.image_file) {
        if (editingEvent.image_url) {
          await deleteImage(editingEvent.image_url);
        }
        const imageUrl = await uploadImage(eventData.image_file);
        if (imageUrl) {
          updateData.image_url = imageUrl;
        }
      }

      const { error } = await supabase
        .from('evenement')
        .update(updateData)
        .eq('id', editingEvent.id);

      if (error) throw error;

      toast({ title: 'Succès', description: 'Événement mis à jour avec succès' });
      setShowEditModal(false);
      setEditingEvent(null);
      setEditCategories([]);
      setEditCategoryInput('');
      fetchEvents();
    } catch (err: any) {
      console.error('Update event error:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Erreur', description: 'Veuillez sélectionner une image', variant: 'destructive' });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Erreur', description: 'L\'image ne doit pas dépasser 5MB', variant: 'destructive' });
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      
      if (isEdit && editingEvent) {
        setEditingEvent({ ...editingEvent, image_url: previewUrl });
      } else {
        setNewEvent({
          ...newEvent,
          image_file: file,
          image_preview: previewUrl
        });
      }
    }
  };

  const handleAddCategory = () => {
    if (newCategoryInput && !newEvent.categories.includes(newCategoryInput)) {
      setNewEvent({
        ...newEvent,
        categories: [...newEvent.categories, newCategoryInput]
      });
      setNewCategoryInput('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setNewEvent({
      ...newEvent,
      categories: newEvent.categories.filter(c => c !== category)
    });
  };

  const handleEditAddCategory = () => {
    if (editCategoryInput && !editCategories.includes(editCategoryInput)) {
      setEditCategories([...editCategories, editCategoryInput]);
      setEditCategoryInput('');
    }
  };

  const handleEditRemoveCategory = (category: string) => {
    setEditCategories(editCategories.filter(c => c !== category));
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setEditCategories([...event.categories]);
    setEditCategoryInput('');
    setShowEditModal(true);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.place?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || (event.categories && event.categories.includes(filterCategory));
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string, date: string, heure?: string) => {
    const isExpired = isDatePassed(date, heure);
    
    if (isExpired && status !== 'termine' && status !== 'annule') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          <AlertTriangle className="w-3 h-3" />
          Date dépassée
        </span>
      );
    }
    
    const statusConfig = {
      a_venir: { label: 'À venir', className: 'bg-blue-100 text-blue-700' },
      en_cours: { label: 'En cours', className: 'bg-green-100 text-green-700' },
      termine: { label: 'Terminé', className: 'bg-gray-100 text-gray-700' },
      annule: { label: 'Annulé', className: 'bg-red-100 text-red-700' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>{config.label}</span>;
  };

  const getPlacesStatus = (disponibles: number, max: number) => {
    if (max === 0) return { text: 'Illimité', color: 'text-gray-600', bg: 'bg-gray-100', width: 0 };
    const ratio = disponibles / max;
    if (ratio === 0) return { text: 'Complet', color: 'text-red-600', bg: 'bg-red-500', width: 100 };
    if (ratio <= 0.2) return { text: 'Dernières places', color: 'text-orange-600', bg: 'bg-orange-500', width: 80 };
    if (ratio <= 0.5) return { text: 'Places limitées', color: 'text-yellow-600', bg: 'bg-yellow-500', width: 50 };
    return { text: 'Disponible', color: 'text-green-600', bg: 'bg-green-500', width: 25 };
  };

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Authentification requise</h2>
          <p className="text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Stats Cards */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard title="Total" value={events.length} icon={Calendar} color="blue" />
          <StatCard title="À venir" value={events.filter(e => e.status === 'a_venir').length} icon={Zap} color="green" />
          <StatCard title="En cours" value={events.filter(e => e.status === 'en_cours').length} icon={TrendingUp} color="purple" />
          <StatCard title="Terminés" value={events.filter(e => e.status === 'termine').length} icon={Award} color="gray" />
          <StatCard title="Annulés" value={events.filter(e => e.status === 'annule').length} icon={XCircle} color="red" />
          <StatCard 
            title="Dépassés" 
            value={events.filter(e => isDatePassed(e.date, e.heure) && e.status !== 'termine' && e.status !== 'annule').length} 
            icon={AlertTriangle} 
            color="orange" 
          />
        </div>
      </div>

      {/* En-tête avec titre et boutons */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Gestion des événements
            </h1>
            <p className="text-gray-500 text-sm mt-1">Créez, modifiez et gérez tous vos événements</p>
          </div>
          <div className="flex gap-3">
            {/* Menu déroulant pour l'export */}
            <div className="relative group">
              <button
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 shadow-sm"
                onClick={() => document.getElementById('export-menu')?.classList.toggle('hidden')}
              >
                <Download className="w-5 h-5" />
                Exporter
              </button>
              <div id="export-menu" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-20">
                <button
                  onClick={() => {
                    setExportFormat('png');
                    exportAsImage();
                    document.getElementById('export-menu')?.classList.add('hidden');
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  disabled={exporting}
                >
                  <ImageIcon2 className="w-4 h-4 text-green-600" />
                  Exporter en PNG
                </button>
                <button
                  onClick={() => {
                    setExportFormat('jpeg');
                    exportAsImage();
                    document.getElementById('export-menu')?.classList.add('hidden');
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  disabled={exporting}
                >
                  <ImageIcon2 className="w-4 h-4 text-blue-600" />
                  Exporter en JPEG
                </button>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={() => {
                    handlePrint();
                    document.getElementById('export-menu')?.classList.add('hidden');
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-gray-600" />
                  Imprimer
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Nouvel événement
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filtres</span>
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="a_venir">À venir</option>
                <option value="en_cours">En cours</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-3" />
            <p className="text-gray-500">Chargement des événements...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">Aucun événement trouvé</p>
            <p className="text-gray-400 text-sm mt-1">Essayez de modifier vos filtres ou ajoutez un nouvel événement</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                Affichage de <span className="font-semibold text-gray-700">{filteredEvents.length}</span> événement(s)
                {filteredEvents.length !== events.length && (
                  <span className="text-gray-400"> sur {events.length} total</span>
                )}
              </p>
              {exporting && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Export en cours...
                </div>
              )}
            </div>
            <div ref={tableRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredEvents.map((event) => {
                const placesStatus = getPlacesStatus(event.places_disponibles, event.capacite_max);
                const isExpired = isDatePassed(event.date, event.heure);
                
                return (
                  <div 
                    key={event.id} 
                    className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200"
                  >
                    {event.image_url ? (
                      <div className="h-40 sm:h-44 overflow-hidden relative">
                        <img 
                          src={event.image_url} 
                          alt={event.titre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(event.status, event.date, event.heure)}
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 sm:h-44 bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                        <div className="absolute top-3 right-3">
                          {getStatusBadge(event.status, event.date, event.heure)}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 sm:p-5">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1 text-base sm:text-lg">{event.titre}</h3>
                      
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className={isExpired ? 'line-through text-red-500' : ''}>
                            {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {event.heure && (
                            <>
                              <Clock className="w-3.5 h-3.5 ml-1" />
                              <span>{event.heure.substring(0, 5)}</span>
                            </>
                          )}
                        </div>
                        
                        {event.place && (
                          <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="line-clamp-1">{event.place}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.categories && event.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {event.categories.slice(0, 2).map((cat, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-gray-100 text-gray-600">
                              {cat}
                            </span>
                          ))}
                          {event.categories.length > 2 && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-gray-100 text-gray-600">
                              +{event.categories.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {event.capacite_max > 0 && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Places:</span>
                            <span className={`font-medium text-xs ${placesStatus.color}`}>
                              {event.places_disponibles}/{event.capacite_max}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`rounded-full h-1.5 transition-all duration-500 ${placesStatus.bg}`}
                              style={{ width: `${((event.capacite_max - event.places_disponibles) / event.capacite_max) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <div className="flex gap-1">
                          <ActionButton
                            onClick={() => {
                              setViewingEvent(event);
                              setShowViewModal(true);
                            }}
                            icon={<Eye className="w-4 h-4" />}
                            label="Voir"
                            color="blue"
                          />
                          <ActionButton
                            onClick={() => openEditModal(event)}
                            icon={<Edit className="w-4 h-4" />}
                            label="Modifier"
                            color="amber"
                          />
                          <ActionButton
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowDeleteModal(true);
                            }}
                            icon={<Trash2 className="w-4 h-4" />}
                            label="Supprimer"
                            color="red"
                          />
                        </div>
                        
                        <select
                          value={event.status}
                          onChange={(e) => handleUpdateStatus(event, e.target.value)}
                          className={`text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isExpired && event.status !== 'termine' ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                          }`}
                        >
                          <option value="a_venir" disabled={isExpired}>À venir</option>
                          <option value="en_cours">En cours</option>
                          <option value="termine">Terminé</option>
                          <option value="annule">Annulé</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <Modal
          title="Ajouter un événement"
          onClose={() => {
            setShowAddModal(false);
            resetNewEventForm();
          }}
          gradient="from-blue-600 to-purple-600"
        >
          <form onSubmit={handleAddEvent} className="space-y-4">
            <InputField
              label="Titre *"
              type="text"
              value={newEvent.titre}
              onChange={(e) => setNewEvent({...newEvent, titre: e.target.value})}
              required
              placeholder="Nom de l'événement"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Date *"
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                required
              />
              <InputField
                label="Heure"
                type="time"
                value={newEvent.heure}
                onChange={(e) => setNewEvent({...newEvent, heure: e.target.value})}
              />
            </div>
            
            <InputField
              label="Lieu"
              type="text"
              value={newEvent.place}
              onChange={(e) => setNewEvent({...newEvent, place: e.target.value})}
              placeholder="Adresse ou lieu de l'événement"
            />
            
            <CategorySection
              categories={newEvent.categories}
              inputValue={newCategoryInput}
              onInputChange={setNewCategoryInput}
              onAdd={handleAddCategory}
              onRemove={handleRemoveCategory}
            />
            
            <ImageUpload
              preview={newEvent.image_preview}
              onFileChange={(e) => handleFileChange(e, false)}
              onClear={() => setNewEvent({...newEvent, image_file: null, image_preview: ''})}
            />
            
            <TextAreaField
              label="Description"
              value={newEvent.description}
              onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              rows={4}
              placeholder="Description détaillée de l'événement"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Capacité maximale"
                type="number"
                value={newEvent.capacite_max}
                onChange={(e) => setNewEvent({...newEvent, capacite_max: parseInt(e.target.value) || 0})}
                min="0"
              />
              <InputField
                label="Places disponibles"
                type="number"
                value={newEvent.places_disponibles}
                onChange={(e) => setNewEvent({...newEvent, places_disponibles: parseInt(e.target.value) || 0})}
                min="0"
              />
            </div>
            
            <SelectField
              label="Statut"
              value={newEvent.status}
              onChange={(e) => setNewEvent({...newEvent, status: e.target.value as any})}
              options={[
                { value: 'a_venir', label: 'À venir' },
                { value: 'en_cours', label: 'En cours' },
                { value: 'termine', label: 'Terminé' },
                { value: 'annule', label: 'Annulé' }
              ]}
              disabled={isDatePassed(newEvent.date, newEvent.heure)}
            />
            
            <ModalActions
              onCancel={() => {
                setShowAddModal(false);
                resetNewEventForm();
              }}
              isSubmitting={uploading}
              submitText="Ajouter"
              submitIcon={<Plus className="w-4 h-4" />}
            />
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && editingEvent && (
        <Modal
          title="Modifier l'événement"
          onClose={() => {
            setShowEditModal(false);
            setEditingEvent(null);
            setEditCategories([]);
            setEditCategoryInput('');
          }}
          gradient="from-amber-600 to-orange-600"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleUpdateEvent({
              titre: formData.get('titre'),
              date: formData.get('date'),
              heure: formData.get('heure'),
              place: formData.get('place'),
              description: formData.get('description'),
              capacite_max: parseInt(formData.get('capacite_max') as string) || 0,
              places_disponibles: parseInt(formData.get('places_disponibles') as string) || 0,
              image_file: (e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0]
            });
          }} className="space-y-4">
            <InputField
              label="Titre *"
              type="text"
              name="titre"
              defaultValue={editingEvent.titre}
              required
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Date *"
                type="date"
                name="date"
                defaultValue={editingEvent.date.split('T')[0]}
                required
              />
              <InputField
                label="Heure"
                type="time"
                name="heure"
                defaultValue={editingEvent.heure || ''}
              />
            </div>
            
            <InputField
              label="Lieu"
              type="text"
              name="place"
              defaultValue={editingEvent.place || ''}
            />
            
            <CategorySection
              categories={editCategories}
              inputValue={editCategoryInput}
              onInputChange={setEditCategoryInput}
              onAdd={handleEditAddCategory}
              onRemove={handleEditRemoveCategory}
            />
            
            <ImageUpload
              existingImage={editingEvent.image_url}
              onFileChange={(e) => handleFileChange(e, true)}
            />
            
            <TextAreaField
              label="Description"
              name="description"
              defaultValue={editingEvent.description || ''}
              rows={4}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Capacité maximale"
                type="number"
                name="capacite_max"
                defaultValue={editingEvent.capacite_max || 0}
              />
              <InputField
                label="Places disponibles"
                type="number"
                name="places_disponibles"
                defaultValue={editingEvent.places_disponibles || 0}
              />
            </div>
            
            <ModalActions
              onCancel={() => {
                setShowEditModal(false);
                setEditingEvent(null);
                setEditCategories([]);
              }}
              isSubmitting={uploading}
              submitText="Enregistrer"
              submitIcon={<Edit className="w-4 h-4" />}
            />
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Confirmer la suppression</h2>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer l'événement <span className="font-semibold">"{selectedEvent.titre}"</span> ?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingEvent && (
        <Modal
          title="Détails de l'événement"
          onClose={() => {
            setShowViewModal(false);
            setViewingEvent(null);
          }}
          gradient="from-blue-600 to-purple-600"
        >
          <div className="space-y-4">
            {viewingEvent.image_url && (
              <img 
                src={viewingEvent.image_url} 
                alt={viewingEvent.titre}
                className="w-full h-48 sm:h-64 object-cover rounded-xl"
              />
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem label="Titre" value={viewingEvent.titre} />
              <DetailItem label="Statut" value={getStatusBadge(viewingEvent.status, viewingEvent.date, viewingEvent.heure)} isHtml />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem 
                label="Date" 
                value={new Date(viewingEvent.date).toLocaleDateString('fr-FR')}
                icon={<Calendar className="w-4 h-4 text-gray-400" />}
              />
              <DetailItem 
                label="Heure" 
                value={viewingEvent.heure || 'Non spécifiée'}
                icon={<Clock className="w-4 h-4 text-gray-400" />}
              />
            </div>

            <DetailItem 
              label="Lieu" 
              value={viewingEvent.place || 'Non spécifié'}
              icon={<MapPin className="w-4 h-4 text-gray-400" />}
            />

            {viewingEvent.categories && viewingEvent.categories.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Catégories</label>
                <div className="flex flex-wrap gap-2">
                  {viewingEvent.categories.map((cat, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <DetailItem 
              label="Description" 
              value={viewingEvent.description || 'Aucune description'}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailItem label="Capacité" value={`${viewingEvent.capacite_max} personnes`} />
              <DetailItem label="Places disponibles" value={`${viewingEvent.places_disponibles} / ${viewingEvent.capacite_max}`} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Composants réutilisables (identiques à avant)
const StatCard = ({ title, value, icon: Icon, color }: any) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600',
    red: 'bg-red-100 text-red-600',
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

const ActionButton = ({ onClick, icon, label, color }: any) => {
  const colors = {
    blue: 'text-blue-500 hover:bg-blue-50',
    amber: 'text-amber-500 hover:bg-amber-50',
    red: 'text-red-500 hover:bg-red-50'
  };
  
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${colors[color]}`}
      title={label}
    >
      {icon}
    </button>
  );
};

const Modal = ({ title, onClose, children, gradient }: any) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className={`sticky top-0 bg-gradient-to-r ${gradient} px-4 sm:px-6 py-4 rounded-t-2xl flex justify-between items-center`}>
        <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  </div>
);

const InputField = ({ label, ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <input
      {...props}
      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    />
  </div>
);

const TextAreaField = ({ label, ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <textarea
      {...props}
      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
    />
  </div>
);

const SelectField = ({ label, options, ...props }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <select
      {...props}
      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const CategorySection = ({ categories, inputValue, onInputChange, onAdd, onRemove }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">Catégories</label>
    <div className="flex gap-2 mb-3">
      <input
        type="text"
        value={inputValue}
        onChange={(e: any) => onInputChange(e.target.value)}
        placeholder="Ajouter une catégorie"
        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        onKeyPress={(e: any) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
      />
      <button
        type="button"
        onClick={onAdd}
        className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition text-sm"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
    <div className="flex flex-wrap gap-2">
      {categories.map((cat: string, idx: number) => (
        <span key={idx} className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700 flex items-center gap-2">
          {cat}
          <button
            type="button"
            onClick={() => onRemove(cat)}
            className="hover:text-blue-900"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  </div>
);

const ImageUpload = ({ preview, existingImage, onFileChange, onClear }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">Image (optionnel)</label>
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
        <Upload className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">Choisir une image</span>
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />
      </label>
      {preview && (
        <div className="relative w-16 h-16">
          <img src={preview} alt="Aperçu" className="w-full h-full object-cover rounded-lg" />
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
      {existingImage && !preview && (
        <div className="mt-3 sm:mt-0">
          <p className="text-xs text-gray-500 mb-1">Image actuelle:</p>
          <img src={existingImage} alt="Actuelle" className="w-16 h-16 object-cover rounded-lg" />
        </div>
      )}
    </div>
    <p className="text-xs text-gray-500 mt-2">Formats acceptés: JPG, PNG, GIF. Max 5MB</p>
  </div>
);

const ModalActions = ({ onCancel, isSubmitting, submitText, submitIcon }: any) => (
  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
    <button
      type="button"
      onClick={onCancel}
      className="px-5 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm"
    >
      Annuler
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
    >
      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : submitIcon}
      {isSubmitting ? 'Chargement...' : submitText}
    </button>
  </div>
);

const DetailItem = ({ label, value, icon, isHtml }: any) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</label>
    <div className="flex items-center gap-2">
      {icon}
      {isHtml ? value : <p className="text-gray-800">{value}</p>}
    </div>
  </div>
);

export default AdminEvents;