import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  MessageSquare,
  Mail,
  Send,
  Trash2,
  Eye,
  Reply,
  Inbox,
  Filter as FilterIcon,
  RefreshCw,
  Loader2,
  CheckCheck,
  X,
} from 'lucide-react';

interface Message {
  id: string;
  nom: string;           // Changé de 'name' à 'nom'
  email: string;
  sujet: string;         // Changé de 'subject' à 'sujet'
  message: string;
  status: string;
  created_at: string;
  updated_at?: string;
  reponse?: string;
  repondu_par?: string;
  repondu_le?: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    non_lu: 0,
    repondu: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      } else {
        console.log('Messages chargés:', data);
        setMessages(data || []);
        updateStats(data || []);
      }
    } catch (err) {
      console.error('Erreur:', err);
      toast({ title: 'Erreur', description: 'Impossible de charger les messages', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (msgs: Message[]) => {
    setStats({
      total: msgs.length,
      non_lu: msgs.filter(m => m.status === 'non_lu' || !m.status).length,
      repondu: msgs.filter(m => m.status === 'repondu').length
    });
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
    toast({ title: 'Actualisé', description: 'Les messages ont été actualisés' });
  };

  const handleUpdateStatus = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', messageId);

      if (error) throw error;

      toast({ title: 'Succès', description: 'Statut mis à jour' });
      fetchMessages();
    } catch (err: any) {
      console.error('Update status error:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez écrire une réponse', variant: 'destructive' });
      return;
    }

    setReplying(true);
    try {
      const { error } = await supabase
        .from('contact')
        .update({
          status: 'repondu',
          reponse: replyContent,
          repondu_le: new Date().toISOString()
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      toast({ 
        title: 'Succès', 
        description: 'Réponse enregistrée avec succès' 
      });
      
      setShowReplyModal(false);
      setReplyContent('');
      setSelectedMessage(null);
      fetchMessages();
    } catch (err: any) {
      console.error('Reply error:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setReplying(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;
    
    try {
      const { error } = await supabase
        .from('contact')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({ title: 'Succès', description: 'Message supprimé' });
      fetchMessages();
      setSelectedMessage(null);
      setShowViewModal(false);
    } catch (err: any) {
      console.error('Delete error:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) {
      toast({ title: 'Aucun message sélectionné', variant: 'destructive' });
      return;
    }

    if (!confirm(`Supprimer ${selectedMessages.length} message(s) ?`)) return;

    try {
      for (const id of selectedMessages) {
        await supabase.from('contact').delete().eq('id', id);
      }

      toast({ title: 'Succès', description: `${selectedMessages.length} message(s) supprimé(s)` });
      setSelectedMessages([]);
      fetchMessages();
    } catch (err: any) {
      console.error('Bulk delete error:', err);
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const toggleSelectMessage = (messageId: string) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const selectAllMessages = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map(m => m.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      non_lu: { label: 'Non lu', className: 'bg-red-100 text-red-700' },
      lu: { label: 'Lu', className: 'bg-blue-100 text-blue-700' },
      repondu: { label: 'Répondu', className: 'bg-green-100 text-green-700' },
      archive: { label: 'Archivé', className: 'bg-gray-100 text-gray-700' }
    };
    const conf = config[status] || { label: 'Non lu', className: 'bg-red-100 text-red-700' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${conf.className}`}>{conf.label}</span>;
  };

  const formatDate = (date: string) => {
    if (!date) return 'Date inconnue';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return `Aujourd'hui à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    return d.toLocaleDateString('fr-FR');
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sujet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestion des messages</h1>
          <p className="text-gray-500 text-sm mt-1">Consultez et répondez aux messages du formulaire de contact</p>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard 
            title="Total messages" 
            value={stats.total} 
            icon={MessageSquare} 
            color="blue" 
          />
          <StatCard 
            title="Non lus" 
            value={stats.non_lu} 
            icon={Mail} 
            color="red" 
          />
          <StatCard 
            title="Répondus" 
            value={stats.repondu} 
            icon={CheckCheck} 
            color="green" 
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                <FilterIcon className="w-4 h-4" />
                <span>Filtres</span>
              </button>
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="non_lu">Non lus</option>
                <option value="lu">Lus</option>
                <option value="repondu">Répondus</option>
              </select>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedMessages.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-3 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700">
                {selectedMessages.length} message(s) sélectionné(s)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  selectedMessages.forEach(id => handleUpdateStatus(id, 'lu'));
                  setSelectedMessages([]);
                }}
                className="px-3 py-1.5 bg-white text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition"
              >
                Marquer comme lu
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 bg-white text-red-700 rounded-lg text-sm hover:bg-red-100 transition"
              >
                Supprimer
              </button>
              <button
                onClick={() => setSelectedMessages([])}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Messages List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-gray-500">Chargement des messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">Aucun message trouvé</p>
            <p className="text-gray-400 text-sm mt-1">Aucun message ne correspond à vos critères</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                  onChange={selectAllMessages}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-3">Expéditeur</div>
              <div className="col-span-4">Sujet</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2">Date</div>
            </div>

            {/* Messages */}
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-3 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  message.status === 'non_lu' || !message.status ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="lg:col-span-1 flex items-start lg:items-center">
                  <input
                    type="checkbox"
                    checked={selectedMessages.includes(message.id)}
                    onChange={() => toggleSelectMessage(message.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 lg:mt-0"
                  />
                </div>
                
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {message.nom?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{message.nom || 'Anonyme'}</p>
                      <p className="text-xs text-gray-500 break-all">{message.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-4">
                  <p className="font-medium text-gray-800 line-clamp-1">{message.sujet || 'Sans sujet'}</p>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{message.message}</p>
                </div>
                
                <div className="lg:col-span-2">
                  {getStatusBadge(message.status || 'non_lu')}
                </div>
                
                <div className="lg:col-span-2">
                  <div className="flex flex-col items-start lg:items-end gap-2">
                    <span className="text-xs text-gray-500">{formatDate(message.created_at)}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowViewModal(true);
                        }}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMessage(message);
                          setShowReplyModal(true);
                        }}
                        className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition"
                        title="Répondre"
                      >
                        <Reply className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Message Modal */}
      {showViewModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-white">Détail du message</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMessage(null);
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {selectedMessage.nom?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{selectedMessage.nom || 'Anonyme'}</h3>
                    <p className="text-sm text-gray-500 break-all">{selectedMessage.email}</p>
                  </div>
                </div>
                {getStatusBadge(selectedMessage.status || 'non_lu')}
              </div>

              <div className="border-t pt-4">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Sujet</label>
                <p className="text-gray-900 font-medium">{selectedMessage.sujet || 'Sans sujet'}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Message</label>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {selectedMessage.reponse && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCheck className="w-4 h-4 text-green-600" />
                    <label className="text-xs font-medium text-green-700 uppercase tracking-wider">Votre réponse</label>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.reponse}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Répondu le {new Date(selectedMessage.repondu_le!).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                {selectedMessage.status !== 'repondu' && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowReplyModal(true);
                    }}
                    className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Reply className="w-4 h-4" />
                    Répondre
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                  className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 px-4 sm:px-6 py-4 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-white">Répondre au message</h2>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedMessage(null);
                  setReplyContent('');
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">De: <span className="font-medium">{selectedMessage.nom}</span></p>
                <p className="text-sm text-gray-600">Email: <span className="font-medium break-all">{selectedMessage.email}</span></p>
                <p className="text-sm text-gray-600 mt-1">Sujet: <span className="font-medium">{selectedMessage.sujet}</span></p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre réponse</label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  placeholder="Écrivez votre réponse ici..."
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setSelectedMessage(null);
                    setReplyContent('');
                  }}
                  className="px-5 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendReply}
                  disabled={replying}
                  className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {replying ? 'Envoi...' : 'Enregistrer la réponse'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant StatCard
const StatCard = ({ title, value, icon: Icon, color }: any) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    green: 'bg-green-100 text-green-600',
  };
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-10 h-10 ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

// Composant Search
const Search = ({ className, ...props }: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
};

export default AdminMessages;