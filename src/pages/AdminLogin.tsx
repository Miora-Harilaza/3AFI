import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, LogIn, Shield, AlertCircle, Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ Vérifier session existante
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Vérification de session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }

        console.log('Session trouvée:', !!session);

        if (session?.user?.email) {
          console.log('Utilisateur connecté:', session.user.email);
          console.log('Email confirmé:', !!session.user.email_confirmed_at);
          
          if (!session.user.email_confirmed_at) {
            console.log('Email non confirmé, déconnexion');
            await supabase.auth.signOut();
            return;
          }

          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('email', session.user.email)
            .maybeSingle();

          console.log('Rôle utilisateur:', userData?.role);

          if (userError) {
            console.error('Error fetching user role:', userError);
            return;
          }

          if (userData?.role === 'admin') {
            console.log('Redirection vers dashboard admin');
            navigate('/admin');
          }
        }
      } catch (error) {
        console.error('Erreur session:', error);
      }
    };
    
    checkSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setRegisterSuccess(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // 🔐 LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      console.log('Tentative de connexion pour:', email);
      
      if (!email.trim()) throw new Error("L'email est requis");
      if (!password.trim()) throw new Error("Le mot de passe est requis");

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      console.log('Réponse auth:', { 
        user: authData.user?.email, 
        error: error?.message,
        session: !!authData.session
      });

      if (error) {
        console.error('Erreur détaillée:', error);
        
        // Messages d'erreur plus précis
        if (error.message.includes('Invalid login credentials')) {
          throw new Error("Email ou mot de passe incorrect");
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error("Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.");
        }
        if (error.message.includes('User already registered')) {
          throw new Error("Cet email est déjà utilisé. Essayez de vous connecter.");
        }
        throw new Error(error.message);
      }

      if (!authData.user?.email) {
        throw new Error("Utilisateur introuvable");
      }

      // ✅ Vérifier que l'email est confirmé
      if (!authData.user.email_confirmed_at) {
        console.log('Email non confirmé, déconnexion');
        await supabase.auth.signOut();
        throw new Error("Email non confirmé. Veuillez cliquer sur le lien dans votre boîte mail.");
      }

      // Vérifier rôle admin
      console.log('Vérification du rôle admin pour:', authData.user.email);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', authData.user.email)
        .maybeSingle();

      console.log('Données utilisateur:', userData, 'Erreur:', userError);

      if (userError) {
        console.error('Error checking admin role:', userError);
        throw new Error("Erreur lors de la vérification des droits");
      }

      if (!userData) {
        console.log('Utilisateur non trouvé dans la table users, création...');
        // Créer l'entrée utilisateur si elle n'existe pas
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            role: 'admin'
          });
          
        if (insertError) {
          console.error('Erreur création utilisateur:', insertError);
          throw new Error("Erreur lors de la création du profil");
        }
      } else if (userData.role !== 'admin') {
        console.log('Rôle non-admin détecté:', userData.role);
        await supabase.auth.signOut();
        throw new Error("Accès refusé : compte admin uniquement");
      }

      toast({ 
        title: 'Connexion réussie', 
        description: 'Bienvenue Admin 👋',
      });
      
      console.log('Redirection vers dashboard');
      navigate('/admin');

    } catch (err: any) {
      console.error("Erreur login:", err);
      setErrorMessage(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // 📝 REGISTER
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      console.log('Tentative d\'inscription pour:', email);
      
      if (!email.trim()) throw new Error("L'email est requis");
      if (!password.trim()) throw new Error("Le mot de passe est requis");
      if (password.length < 6) throw new Error("Le mot de passe doit contenir au moins 6 caractères");

      // Créer l'utilisateur dans Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          data: {
            role: 'admin'
          }
        },
      });

      console.log('Réponse inscription:', { 
        user: data.user?.email, 
        error: error?.message,
        session: !!data.session
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error("Cet email est déjà utilisé. Essayez de vous connecter.");
        }
        throw error;
      }

      if (!data.user) {
        throw new Error("Erreur lors de la création du compte");
      }

      // Afficher le succès
      setRegisterSuccess(true);
      
      toast({
        title: 'Inscription initiée',
        description: 'Vérifiez votre email pour confirmer votre compte',
      });

    } catch (err: any) {
      console.error("Erreur inscription:", err);
      setErrorMessage(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // 📧 Renvoyer l'email de confirmation
  const handleResendConfirmation = async () => {
    if (resendDisabled) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        }
      });

      if (error) throw error;

      toast({
        title: 'Email envoyé',
        description: 'Un nouveau lien de confirmation a été envoyé',
      });

      setResendDisabled(true);
      setResendCountdown(60);
      
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err: any) {
      console.error('Error resending confirmation:', err);
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de renvoyer l\'email',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Écran de succès post-inscription
  if (registerSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
          <CheckCircle className="mx-auto text-green-400 w-16 h-16 mb-4" />
          <h2 className="text-white text-2xl font-bold mb-2">Vérifiez votre email</h2>
          <p className="text-white/70 mb-6">
            Un lien de confirmation a été envoyé à <span className="text-white font-semibold break-all">{email}</span>.
            <br /><br />
            Cliquez sur ce lien pour activer votre compte, puis connectez-vous.
          </p>
          
          <button
            onClick={handleResendConfirmation}
            disabled={resendDisabled}
            className="w-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition px-6 py-3 rounded-lg text-white font-medium mb-3"
          >
            {resendDisabled 
              ? `Renvoyer l'email (${resendCountdown}s)` 
              : "Renvoyer l'email de confirmation"}
          </button>
          
          <button
            onClick={() => { 
              setRegisterSuccess(false); 
              setIsRegister(false); 
              setPassword('');
              setErrorMessage('');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-lg text-white font-medium"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-blue-400 w-10 h-10" />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">
            {isRegister ? "Créer un compte Admin" : "Espace Administrateur"}
          </h1>
          <p className="text-white/60 text-sm">
            {isRegister 
              ? "Créez votre compte administrateur" 
              : "Connectez-vous à votre espace admin"}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {errorMessage && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 flex gap-3 items-start">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-5">

            {/* EMAIL */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Adresse email"
                className="w-full pl-10 pr-3 py-3 rounded-lg bg-black/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={isRegister ? "Mot de passe (min. 6 caractères)" : "Mot de passe"}
                className="w-full pl-10 pr-10 py-3 rounded-lg bg-black/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition py-3 rounded-lg text-white font-medium flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  <span>Chargement...</span>
                </>
              ) : (
                <>
                  {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
                  {isRegister ? "Créer un compte" : "Se connecter"}
                </>
              )}
            </button>

          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p
              className="text-sm text-center text-white/60 cursor-pointer hover:text-white transition"
              onClick={() => { 
                setIsRegister(!isRegister); 
                setErrorMessage('');
                setPassword('');
              }}
            >
              {isRegister
                ? "Déjà un compte ? Connectez-vous"
                : "Pas encore de compte ? Créez-en un"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;