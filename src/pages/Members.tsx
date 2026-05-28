import { useState, useEffect, useRef } from "react";
import { Search, Mail, Phone, ChevronDown, MapPin, Calendar, Heart, Award, Users, Music, Grid3x3, LayoutList, UserPlus, Star, Clock, Loader2, Cake, Home, Eye, MessageCircle, UserCheck, Sparkles, X, Send, Copy, Check, AlertCircle, Printer, Download, MoreHorizontal, ThumbsUp, Share2, Flag, UserMinus, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  nom: string;
  poste: string;
  telephone: string;
  date_naissance: string;
  adresse: string;
  status: string;
  avatar_url: string | null;
  created_at: string;
}

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("Tous");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "table">("list");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [activeTab, setActiveTab] = useState<"tous" | "recent" | "actifs">("tous");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printData, setPrintData] = useState<Member[]>([]);
  const [numberOfColumns, setNumberOfColumns] = useState(5);
  const [showAdidyPrint, setShowAdidyPrint] = useState(false);
  const [adidyData, setAdidyData] = useState<Member[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const adidyPrintRef = useRef<HTMLDivElement>(null);

  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('membre')
        .select('*')
        .eq('status', 'actif')
        .order('nom', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formatDateLong = (date: string) => {
    if (!date) return '-';
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    const d = new Date(date);
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getMonthInFrench = (date: string) => {
    if (!date) return '';
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    const d = new Date(date);
    return months[d.getMonth()];
  };

  const matchesSearch = (member: Member, searchTerm: string) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const nomMatch = member.nom?.toLowerCase().includes(searchLower);
    const posteMatch = member.poste?.toLowerCase().includes(searchLower);
    const adresseMatch = member.adresse?.toLowerCase().includes(searchLower);
    const telephoneMatch = member.telephone?.toLowerCase().includes(searchLower);
    const birthDateFormatted = formatDateLong(member.date_naissance).toLowerCase();
    const birthDateMatch = birthDateFormatted.includes(searchLower);
    const monthMatch = getMonthInFrench(member.date_naissance).toLowerCase().includes(searchLower);
    const yearMatch = member.date_naissance ? new Date(member.date_naissance).getFullYear().toString().includes(searchLower) : false;
    const dayMatch = member.date_naissance ? new Date(member.date_naissance).getDate().toString().includes(searchLower) : false;
    
    return nomMatch || posteMatch || adresseMatch || telephoneMatch || birthDateMatch || monthMatch || yearMatch || dayMatch;
  };

  const getRandomPastelColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const handleContact = (member: Member) => {
    setSelectedMember(member);
    setShowContactModal(true);
    setContactMessage("");
  };

  const handleSendMessage = async () => {
    if (!selectedMember || !contactMessage.trim()) {
      toast({
        title: 'Message vide',
        description: 'Veuillez écrire un message avant d\'envoyer.',
        variant: 'destructive',
      });
      return;
    }

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('contact')
        .insert([
          {
            nom: selectedMember.nom,
            email: `contact@${selectedMember.nom.toLowerCase().replace(/\s/g, '')}.com`,
            message: contactMessage,
            status: 'non_lu',
            destinataire_id: selectedMember.id,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      toast({
        title: 'Message envoyé !',
        description: `Votre message a été envoyé à ${selectedMember.nom}.`,
        variant: 'default',
      });

      setShowContactModal(false);
      setContactMessage("");
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le message. Veuillez réessayer.",
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    toast({
      title: 'Copié !',
      description: 'Le numéro de téléphone a été copié.',
      variant: 'default',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handlePrint = () => {
    const filteredMembers = members.filter((m) => {
      const matchRole = selectedRole === "Tous" || m.poste === selectedRole;
      return matchesSearch(m, search) && matchRole;
    });

    if (filteredMembers.length === 0) {
      toast({
        title: 'Aucune donnée',
        description: 'Il n\'y a aucun membre à imprimer.',
        variant: 'destructive',
      });
      return;
    }

    setPrintData(filteredMembers);
    setShowPrintPreview(true);
  };

  // NOUVEAU: Impression Adidy - Feuille de présence par mois
  const handleAdidyPrint = () => {
    const filteredMembers = members.filter((m) => {
      const matchRole = selectedRole === "Tous" || m.poste === selectedRole;
      return matchesSearch(m, search) && matchRole;
    });

    if (filteredMembers.length === 0) {
      toast({
        title: 'Aucune donnée',
        description: 'Il n\'y a aucun membre à imprimer.',
        variant: 'destructive',
      });
      return;
    }

    setAdidyData(filteredMembers);
    setShowAdidyPrint(true);
  };

  const handleAdidyPrintExecute = () => {
    const printContent = adidyPrintRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Feuille de présence mensuelle - STK AntsoMaFi</title>
            <meta charset="UTF-8">
            <style>
              @page {
                size: A4 landscape;
                margin: 1cm;
              }
              
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Segoe UI', Arial, sans-serif;
                  background: white;
                  color: #1a1a1a;
                  font-size: 9pt;
                }
                
                .adidy-container {
                  max-width: 100%;
                }
                
                .header {
                  text-align: center;
                  margin-bottom: 15px;
                  border-bottom: 2px solid #1a4d8c;
                  padding-bottom: 10px;
                }
                
                .header h1 {
                  color: #1a4d8c;
                  margin: 0;
                  font-size: 18pt;
                  font-weight: bold;
                }
                
                .header .subtitle {
                  color: #555;
                  font-size: 10pt;
                  margin-top: 3px;
                }
                
                .header .year {
                  font-size: 14pt;
                  font-weight: bold;
                  color: #1a4d8c;
                  margin-top: 5px;
                }
                
                .adidy-table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 8pt;
                }
                
                .adidy-table th {
                  background: #1a4d8c;
                  color: white;
                  padding: 6px 4px;
                  text-align: center;
                  font-weight: bold;
                  border: 1px solid #2c6fb0;
                  font-size: 8pt;
                }
                
                .adidy-table td {
                  padding: 6px 4px;
                  border: 1px solid #ccc;
                  vertical-align: middle;
                }
                
                .adidy-table td:first-child {
                  text-align: left;
                  font-weight: 500;
                }
                
                .checkbox-cell {
                  text-align: center;
                  width: 45px;
                }
                
                .checkbox-placeholder {
                  display: inline-block;
                  width: 14px;
                  height: 14px;
                  border: 1.5px solid #333;
                  background: white;
                }
                
                .month-header {
                  font-weight: bold;
                  font-size: 9pt;
                }
                
                .footer {
                  margin-top: 15px;
                  padding-top: 8px;
                  border-top: 1px solid #ccc;
                  font-size: 7pt;
                  color: #666;
                  text-align: center;
                }
                
                .legend {
                  margin-top: 10px;
                  font-size: 7pt;
                  display: flex;
                  gap: 15px;
                  justify-content: center;
                }
                
                .signature-section {
                  margin-top: 20px;
                  display: flex;
                  justify-content: space-between;
                  flex-wrap: wrap;
                  gap: 15px;
                }
                
                .signature-line {
                  text-align: center;
                  width: 180px;
                }
                
                .signature-line .line {
                  border-bottom: 1px solid #000;
                  margin-top: 25px;
                  width: 160px;
                }
              }
            </style>
          </head>
          <body>
            <div class="adidy-container">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              }
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handlePrintExecute = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Feuille de présence - STK AntsoMaFi</title>
            <meta charset="UTF-8">
            <style>
              @page {
                size: A4 landscape;
                margin: 1.5cm;
              }
              
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Segoe UI', Arial, sans-serif;
                  background: white;
                  color: #1a1a1a;
                }
                
                .print-container {
                  max-width: 100%;
                }
                
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                  border-bottom: 2px solid #1a4d8c;
                  padding-bottom: 15px;
                }
                
                .header h1 {
                  color: #1a4d8c;
                  margin: 0;
                  font-size: 20pt;
                  font-weight: bold;
                }
                
                .header .subtitle {
                  color: #555;
                  font-size: 11pt;
                  margin-top: 5px;
                }
                
                .attendance-table {
                  width: 100%;
                  border-collapse: collapse;
                  font-size: 10pt;
                }
                
                .attendance-table th {
                  background: #1a4d8c;
                  color: white;
                  padding: 10px 8px;
                  text-align: center;
                  font-weight: bold;
                  border: 1px solid #2c6fb0;
                }
                
                .attendance-table td {
                  padding: 10px 8px;
                  border: 1px solid #ccc;
                  vertical-align: middle;
                }
                
                .attendance-table td:first-child {
                  text-align: left;
                  font-weight: 500;
                }
                
                .checkbox-cell {
                  text-align: center;
                  width: 60px;
                }
                
                .checkbox-placeholder {
                  display: inline-block;
                  width: 20px;
                  height: 20px;
                  border: 1.5px solid #333;
                  background: white;
                }
                
                .date-header {
                  font-weight: bold;
                  font-size: 10pt;
                }
                
                .date-subheader {
                  font-size: 8pt;
                  font-weight: normal;
                  margin-top: 3px;
                }
                
                .footer {
                  margin-top: 20px;
                  padding-top: 10px;
                  border-top: 1px solid #ccc;
                  font-size: 8pt;
                  color: #666;
                  text-align: center;
                }
                
                .signature-section {
                  margin-top: 30px;
                  display: flex;
                  justify-content: space-between;
                  flex-wrap: wrap;
                  gap: 20px;
                }
                
                .signature-line {
                  text-align: center;
                  width: 200px;
                }
                
                .signature-line .line {
                  border-bottom: 1px solid #000;
                  margin-top: 30px;
                  width: 180px;
                }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              }
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Imprimer la liste des membres
  const handlePrintMembers = () => {
    const filteredMembers = members.filter((m) => {
      const matchRole = selectedRole === "Tous" || m.poste === selectedRole;
      return matchesSearch(m, search) && matchRole;
    });

    if (filteredMembers.length === 0) {
      toast({
        title: 'Aucune donnée',
        description: 'Il n\'y a aucun membre à imprimer.',
        variant: 'destructive',
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Liste des membres - STK AntsoMaFi</title>
            <meta charset="UTF-8">
            <style>
              @page {
                size: A4;
                margin: 2cm;
              }
              
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Segoe UI', Arial, sans-serif;
                  background: white;
                  color: #1a1a1a;
                }
                
                .header {
                  text-align: center;
                  margin-bottom: 30px;
                  border-bottom: 2px solid #1a4d8c;
                  padding-bottom: 20px;
                }
                
                .header h1 {
                  color: #1a4d8c;
                  margin: 0;
                  font-size: 24pt;
                  font-weight: bold;
                }
                
                .header .subtitle {
                  color: #555;
                  font-size: 12pt;
                  margin-top: 5px;
                }
                
                .header .date {
                  color: #666;
                  font-size: 10pt;
                  margin-top: 10px;
                }
                
                .members-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 20px 0;
                  font-size: 10pt;
                }
                
                .members-table th {
                  background: #1a4d8c;
                  color: white;
                  padding: 10px;
                  text-align: left;
                  border: 1px solid #2c6fb0;
                }
                
                .members-table td {
                  padding: 8px 10px;
                  border: 1px solid #ccc;
                  vertical-align: top;
                }
                
                .members-table tr:nth-child(even) {
                  background-color: #f9f9f9;
                }
                
                .role-badge {
                  display: inline-block;
                  padding: 2px 8px;
                  background: #e8e8e8;
                  border-radius: 12px;
                  font-size: 9pt;
                }
                
                .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 10px;
                  border-top: 1px solid #ccc;
                  font-size: 8pt;
                  color: #666;
                }
                
                .signature {
                  margin-top: 40px;
                  display: flex;
                  justify-content: space-between;
                }
                
                .signature-line {
                  text-align: center;
                  width: 200px;
                }
                
                .signature-line .line {
                  border-bottom: 1px solid #000;
                  margin-top: 40px;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>STK AntsoMaFi</h1>
              <div class="subtitle">Chorale Gospel - Liste des membres</div>
              <div class="date">
                Généré le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                ${search ? `<br>Filtre de recherche : "${search}"` : ''}
              </div>
            </div>
            
            <table class="members-table">
              <thead>
                <tr>
                  <th style="width: 5%">N°</th>
                  <th style="width: 30%">Nom complet</th>
                  <th style="width: 15%">Rôle</th>
                  <th style="width: 20%">Téléphone</th>
                  <th style="width: 30%">Adresse</th>
                 
                </tr>
              </thead>
              <tbody>
                ${filteredMembers.map((member, index) => `
                  <tr>
                    <td style="text-align: center">${index + 1}</td>
                    <td><strong>${member.nom}</strong><br><span style="font-size: 8pt; color: #666;">Né(e) le ${formatDateLong(member.date_naissance)}</span></td>
                    <td><span class="role-badge">${member.poste || 'Membre'}</span></td>
                    <td>${member.telephone || ' '}</td>
                    <td>${member.adresse?.split(',')[0] || ' '}</td>
                  
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div style="margin-top: 20px; padding: 10px; background: #f5f5f5;">
              <strong>Total des membres :</strong> ${filteredMembers.length}
            </div>
            
            <div class="signature">
              <div class="signature-line">
                <div class="line"></div>
                <div style="font-size: 9pt; margin-top: 5px;">Signature responsable</div>
              </div>
              <div class="signature-line">
                <div class="line"></div>
                <div style="font-size: 9pt; margin-top: 5px;">Cachet association</div>
              </div>
            </div>
            
            <div class="footer">
              Document officiel - STK AntsoMaFi
            </div>
            
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              }
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const filtered = members.filter((m) => {
    const matchRole = selectedRole === "Tous" || m.poste === selectedRole;
    return matchesSearch(m, search) && matchRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Music className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Chargement des membres...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Header responsive */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          {/* Titre et compteur */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Membres</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filtered.length} membre{filtered.length > 1 ? "s" : ""} dans le groupe
            </p>
          </div>
          
          {/* Barre de recherche et boutons - Version responsive */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Barre de recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, date (ex: 15 janvier 1990), mois (ex: janvier), année (ex: 1990)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 border-0 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all"
              />
            </div>
            
            {/* Boutons d'action */}
            <div className="flex gap-2">
              <button 
                onClick={handlePrint}
                className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Présence</span>
              </button>
              <button 
                onClick={handlePrintMembers}
                className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Membres</span>
              </button>
              {/* NOUVEAU BOUTON ADIDY */}
              <button 
                onClick={handleAdidyPrint}
                className="flex-1 sm:flex-none px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Adidy</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 sm:gap-6 mt-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {[
              { id: "tous", label: "Tous", count: filtered.length },
              { id: "recent", label: "Récents", count: members.slice(0, 5).length },
              { id: "actifs", label: "Actifs", count: filtered.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-1 text-sm font-medium transition-all relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs text-gray-400">({tab.count})</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Liste style Facebook */}
        <div className="space-y-3">
          {filtered.map((member) => {
            const age = calculateAge(member.date_naissance);
            const gradientColor = getRandomPastelColor(member.nom);
            const birthDateFormatted = formatDateLong(member.date_naissance);
            return (
              <div
                key={member.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => setSelectedMember(member)}>
                      {member.avatar_url ? (
                        <img 
                          src={member.avatar_url} 
                          alt={member.nom} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradientColor} flex items-center justify-center`}>
                          <span className="text-white text-lg font-bold">{getInitials(member.nom)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 
                          className="font-semibold text-gray-900 dark:text-white hover:underline cursor-pointer"
                          onClick={() => setSelectedMember(member)}
                        >
                          {member.nom}
                        </h3>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                          {member.poste || 'Membre'}
                        </span>
                        {age && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Cake className="w-3 h-3" />
                            {age} ans
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                        {member.telephone && (
                          <button
                            onClick={() => handleCall(member.telephone!)}
                            className="flex items-center gap-1 hover:text-blue-600 transition"
                          >
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate max-w-[120px] sm:max-w-none">{member.telephone}</span>
                          </button>
                        )}
                        {member.adresse && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate max-w-[120px] sm:max-w-[200px]">{member.adresse.split(',')[0]}</span>
                          </div>
                        )}
                        {member.date_naissance && (
                          <div className="flex items-center gap-1 text-purple-600">
                            <Cake className="w-3 h-3 flex-shrink-0" />
                            <span className="font-medium text-xs whitespace-normal break-words">
                              {birthDateFormatted}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => handleContact(member)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden xs:inline">Message</span>
                        </button>
                        {member.telephone && (
                          <>
                            <button
                              onClick={() => handleCall(member.telephone!)}
                              className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            >
                              <Phone className="w-4 h-4" />
                              <span className="hidden xs:inline">Appeler</span>
                            </button>
                            <button
                              onClick={() => handleCopyPhone(member.telephone!)}
                              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition"
                              title="Copier le numéro"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition flex-shrink-0">
                      <MoreHorizontal className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Aucun membre trouvé</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Essayez "janvier", "15", "1990" ou un autre critère</p>
          </div>
        )}
      </div>

      {/* Modal d'impression - FEUILLE DE PRÉSENCE SIMPLE AVEC CASES */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-4 sm:p-5 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <h2 className="text-white text-lg sm:text-xl font-semibold">Feuille de présence</h2>
              </div>
              <button
                onClick={() => setShowPrintPreview(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition"
              >
                <X size={22} />
              </button>
            </div>
            
            {/* Configuration simple */}
            <div className="p-4 sm:p-6 bg-gray-50 border-b">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de colonnes pour les dates</label>
              <input
                type="number"
                min="1"
                max="15"
                value={numberOfColumns}
                onChange={(e) => setNumberOfColumns(Math.min(15, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">Vous pourrez écrire les dates à la main après impression</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
              <div ref={printRef} className="bg-white shadow-2xl mx-auto" style={{ width: '297mm', minHeight: '210mm', margin: '0 auto', padding: '15px' }}>
                {/* En-tête */}
                <div className="header">
                  <h1>STK AntsoMaFi</h1>
                  <div className="subtitle">Chorale Gospel - Feuille de présence</div>
                </div>

                {/* Tableau de présence simple */}
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th style={{ width: '5%' }}>N°</th>
                      <th style={{ width: '30%' }}>Nom du membre</th>
                      <th style={{ width: '10%' }}>Rôle</th>
                      {Array.from({ length: numberOfColumns }).map((_, idx) => (
                        <th key={idx} style={{ width: `${55 / numberOfColumns}%` }}>
                          <div className="date-header">Date</div>
                          <div className="date-subheader">___ / ___ / _____</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {printData.map((member, index) => (
                      <tr key={member.id}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td>
                          <strong>{member.nom}</strong>
                          {member.date_naissance && (
                            <div style={{ fontSize: '7pt', color: '#666', marginTop: '2px' }}>
                              Né(e) le {formatDateLong(member.date_naissance)}
                            </div>
                          )}
                          {member.telephone && (
                            <div style={{ fontSize: '7pt', color: '#666', marginTop: '2px' }}>
                              {member.telephone}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>{member.poste || 'Membre'}</td>
                        {Array.from({ length: numberOfColumns }).map((_, idx) => (
                          <td key={idx} className="checkbox-cell">
                            <div className=""></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total */}
                <div style={{ marginTop: '15px', padding: '8px', background: '#f5f5f5', fontSize: '9pt' }}>
                  <strong>Total des membres :</strong> {printData.length}
                </div>

                {/* Légende simple */}
                <div style={{ marginTop: '15px', fontSize: '9pt' }}>
                  <strong>Légende :</strong> ✓ = Présent &nbsp;&nbsp; ✗ = Absent &nbsp;&nbsp; ● = Retard &nbsp;&nbsp; ▲ = Excusé
                </div>

                {/* Signatures */}
                <div className="signature-section">
                  <div className="signature-line">
                    <div className="line"></div>
                    <div style={{ fontSize: '8pt', marginTop: '5px' }}>Signature responsable</div>
                  </div>
                  <div className="signature-line">
                    <div className="line"></div>
                    <div style={{ fontSize: '8pt', marginTop: '5px' }}>Cachet</div>
                  </div>
                </div>

                <div className="footer">
                  Document généré le {new Date().toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-3 justify-end bg-gray-50">
              <button
                onClick={() => setShowPrintPreview(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
              >
                Annuler
              </button>
              <button
                onClick={handlePrintExecute}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOUVEAU MODAL ADIDY - Impression par mois (Janvier à Décembre) */}
      {showAdidyPrint && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-purple-800 to-pink-600 p-4 sm:p-5 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <h2 className="text-white text-lg sm:text-xl font-semibold"> Adidy</h2>
              </div>
              <button
                onClick={() => setShowAdidyPrint(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition"
              >
                <X size={22} />
              </button>
            </div>
            
            {/* Configuration Adidy */}
            <div className="p-4 sm:p-6 bg-gray-50 border-b">
              <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
              <input
                type="number"
                min="2020"
                max="2030"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">Tableau des présences par mois (Janvier à Décembre) - Cases à cocher pour chaque mois</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
              <div ref={adidyPrintRef} className="bg-white shadow-2xl mx-auto" style={{ width: '297mm', minHeight: '210mm', margin: '0 auto', padding: '12px' }}>
                {/* En-tête */}
                <div className="header">
                  <h1>STK AntsoMaFi</h1>
                  <div className="subtitle">STK ANTSOMAFI -  adidy isam-bolana</div>
                  <div className="year">Année {selectedYear}</div>
                </div>

                {/* Tableau des présences par mois */}
                <table className="adidy-table">
                  <thead>
                    <tr>
                      <th style={{ width: '5%' }}>N°</th>
                      <th style={{ width: '25%' }}>Nom du membre</th>
                      <th style={{ width: '10%' }}>Rôle</th>
                      {months.map((month, idx) => (
                        <th key={idx} style={{ width: '5%' }}>
                          <div className="month-header">{month.substring(0, 3)}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adidyData.map((member, index) => (
                      <tr key={member.id}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td>
                          <strong>{member.nom}</strong>
                          {member.date_naissance && (
                            <div style={{ fontSize: '6pt', color: '#666', marginTop: '2px' }}>
                              Né(e) le {formatDateLong(member.date_naissance)}
                            </div>
                          )}
                          {member.telephone && (
                            <div style={{ fontSize: '6pt', color: '#666', marginTop: '2px' }}>
                              {member.telephone}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center', fontSize: '7pt' }}>{member.poste || 'Membre'}</td>
                        {months.map((_, idx) => (
                          <td key={idx} className="checkbox-cell">
                            <div className=""></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total */}
                <div style={{ marginTop: '12px', padding: '6px', background: '#f5f5f5', fontSize: '8pt' }}>
                  <strong>Total des membres :</strong> {adidyData.length}
                </div>

                {/* Légende */}
                <div className="legend">
                  <span>✓ = Présent</span>
                  <span>✗ = Absent</span>
                  <span>● = Retard</span>
                  <span>▲ = Excusé</span>
                </div>

                {/* Signatures */}
                <div className="signature-section">
                  <div className="signature-line">
                    <div className="line"></div>
                    <div style={{ fontSize: '7pt', marginTop: '5px' }}>Signature responsable</div>
                  </div>
                  <div className="signature-line">
                    <div className="line"></div>
                    <div style={{ fontSize: '7pt', marginTop: '5px' }}>Cachet association</div>
                  </div>
                </div>

                <div className="footer">
                  Document généré le {new Date().toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-3 justify-end bg-gray-50">
              <button
                onClick={() => setShowAdidyPrint(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleAdidyPrintExecute}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition flex items-center gap-2 shadow-md"
              >
                <Printer className="w-4 h-4" />
                Imprimer Adidy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Profil - Version responsive */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative px-4 sm:px-6">
              <div className="absolute -top-10 sm:-top-12 left-4 sm:left-6">
                {selectedMember.avatar_url ? (
                  <img 
                    src={selectedMember.avatar_url} 
                    alt={selectedMember.nom} 
                    className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover cursor-pointer"
                    onClick={() => setShowFullImage(true)}
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white dark:border-gray-800">
                    <span className="text-white text-2xl sm:text-3xl font-bold">{getInitials(selectedMember.nom)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 sm:px-6 pt-12 sm:pt-14 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{selectedMember.nom}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{selectedMember.poste || 'Membre'}</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
                  Modifier
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {selectedMember.telephone && (
                  <div className="flex flex-wrap items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span>{selectedMember.telephone}</span>
                    <button
                      onClick={() => handleCopyPhone(selectedMember.telephone!)}
                      className="ml-auto text-blue-600 text-sm hover:underline"
                    >
                      Copier
                    </button>
                  </div>
                )}
                {selectedMember.date_naissance && (
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Cake className="w-5 h-5 text-gray-400" />
                    <span>{formatDateLong(selectedMember.date_naissance)} • {calculateAge(selectedMember.date_naissance)} ans</span>
                  </div>
                )}
                {selectedMember.adresse && (
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Home className="w-5 h-5 text-gray-400" />
                    <span className="break-words">{selectedMember.adresse}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>Membre depuis {formatDateLong(selectedMember.created_at)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => handleContact(selectedMember)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Envoyer un message
                </button>
                {selectedMember.telephone && (
                  <button
                    onClick={() => handleCall(selectedMember.telephone!)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Appeler
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Contact */}
      {showContactModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {selectedMember.avatar_url ? (
                  <img src={selectedMember.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold">{getInitials(selectedMember.nom)}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selectedMember.nom}</h3>
                  <p className="text-xs text-gray-500">Envoyer un message</p>
                </div>
              </div>
              
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Écrivez votre message ici..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
              
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {sendingMessage ? 'Envoi...' : 'Envoyer'}
                </button>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal photo plein écran */}
      {showFullImage && selectedMember && selectedMember.avatar_url && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4 cursor-pointer"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-4xl w-full">
            <img 
              src={selectedMember.avatar_url} 
              alt={selectedMember.nom} 
              className="w-full h-auto rounded-lg"
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}