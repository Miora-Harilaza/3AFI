import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Index from "./pages/Index.tsx";
import Members from "./pages/Members.tsx";
import Events from "./pages/Events.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";
import GalerieComplete from "./components/GalerieComplete.tsx";

// Admin imports
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminLayout from "./components/Admin/AdminLayout.tsx";
import Dashboard from "./components/Admin/Dashboard.tsx";
import AdminMembers from "./components/Admin/AdminMembers.tsx";
import AdminEvents from "./components/Admin/AdminEvents.tsx";
import AdminSettings from "./components/Admin/AdminSettings.tsx";
import AdminMessages from "./components/Admin/AdminMessages.tsx";
import AdminProfile from "./components/Admin/AdminProfile.tsx";
import AdminReunions from "./components/Admin/Reunion.tsx";
import ReunionsPublic from "./components/reunionclient.tsx";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Index />} />
            <Route path="/membres" element={<Members />} />
            <Route path="/evenements" element={<Events />} />
            <Route path="/contact" element={<Contact />} />
              <Route path="/reunionspublic" element={<ReunionsPublic />} />


            <Route path="/galerie" element={<GalerieComplete />} />

            {/* Routes admin - Redirection */}
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Routes admin protégées avec layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="members" element={<AdminMembers />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
                   <Route path="reunions" element={<AdminReunions />} />


            </Route>

            {/* Route catch-all pour les pages non trouvées */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;