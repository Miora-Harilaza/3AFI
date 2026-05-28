import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Stats {
  totalMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  unreadMessages: number;
}

interface ChartData {
  month: string;
  membres: number;
  evenements: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [eventTypeData, setEventTypeData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchChartData();
    fetchEventTypeDistribution();
  }, []);

  const fetchStats = async () => {
    try {
      // Total membres
      const { count: membersCount } = await supabase
        .from('membre')
        .select('*', { count: 'exact', head: true });

      // Total événements
      const { count: eventsCount } = await supabase
        .from('evenement')
        .select('*', { count: 'exact', head: true });

      // Événements à venir
      const { count: upcomingCount } = await supabase
        .from('evenement')
        .select('*', { count: 'exact', head: true })
        .gte('date', new Date().toISOString().split('T')[0]);

      // Messages non lus
      const { count: unreadCount } = await supabase
        .from('contact')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'non_lu');

      setStats({
        totalMembers: membersCount || 0,
        totalEvents: eventsCount || 0,
        upcomingEvents: upcomingCount || 0,
        unreadMessages: unreadCount || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      // Récupérer les données des 6 derniers mois
      const months = [];
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = date.toLocaleString('fr', { month: 'short' });
        months.push({
          month: monthName,
          year: date.getFullYear(),
          startDate: new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0],
        });
      }

      const data = await Promise.all(
        months.map(async ({ month, startDate, endDate }) => {
          // Compter les membres créés dans ce mois
          const { count: membresCount } = await supabase
            .from('membre')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          // Compter les événements créés dans ce mois
          const { count: evenementsCount } = await supabase
            .from('evenement')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          return {
            month,
            membres: membresCount || 0,
            evenements: evenementsCount || 0,
          };
        })
      );

      setChartData(data);
    } catch (error) {
      console.error('Erreur lors du chargement des données du graphique:', error);
    }
  };

  const fetchEventTypeDistribution = async () => {
    try {
      const { data, error } = await supabase
        .from('evenement')
        .select('type, count')
        .select('type');

      if (error) throw error;

      // Compter par type d'événement
      const typeCount: { [key: string]: number } = {};
      data?.forEach((event: any) => {
        typeCount[event.type] = (typeCount[event.type] || 0) + 1;
      });

      const pieData = Object.entries(typeCount).map(([name, value]) => ({
        name: name === 'conference' ? 'Conférence' :
              name === 'atelier' ? 'Atelier' :
              name === 'meetup' ? 'Meetup' :
              name === 'formation' ? 'Formation' : name,
        value,
      }));

      setEventTypeData(pieData);
    } catch (error) {
      console.error('Erreur lors du chargement de la distribution des événements:', error);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const statCards = [
    {
      title: 'Membres',
      value: stats.totalMembers,
      icon: Users,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Événements',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Événements à venir',
      value: stats.upcomingEvents,
      icon: TrendingUp,
      color: 'bg-orange-500',
      gradient: 'from-orange-500 to-orange-600',
    },
    {
      title: 'Messages non lus',
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.title} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-foreground">{stat.value}</span>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
          </div>
        ))}
      </div>

      {/* Graphique principal - Évolution */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Évolution des membres et événements</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="membres"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 6 }}
                activeDot={{ r: 8 }}
                name="Nouveaux membres"
              />
              <Line
                type="monotone"
                dataKey="evenements"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 6 }}
                activeDot={{ r: 8 }}
                name="Nouveaux événements"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphiques secondaires */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Graphique en barres */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Comparaison mensuelle</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Bar dataKey="membres" fill="#3B82F6" name="Membres" radius={[8, 8, 0, 0]} />
                <Bar dataKey="evenements" fill="#10B981" name="Événements" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique circulaire - Distribution des types d'événements */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Distribution par type d'événement</h2>
          <div className="h-80">
            {eventTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eventTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graphique en aires */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Tendance cumulative</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="membres"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
                name="Membres"
              />
              <Area
                type="monotone"
                dataKey="evenements"
                stackId="2"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.3}
                name="Événements"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Derniers membres */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Derniers membres</h2>
          <div className="space-y-3">
            {/* Ici vous pouvez ajouter une liste des derniers membres */}
            <p className="text-muted-foreground text-sm">Chargement des membres...</p>
          </div>
        </div>

        {/* Prochains événements */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Prochains événements</h2>
          <div className="space-y-3">
            {/* Ici vous pouvez ajouter une liste des prochains événements */}
            <p className="text-muted-foreground text-sm">Chargement des événements...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;