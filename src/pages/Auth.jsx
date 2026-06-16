import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { supabase } from '../supabase';
import { useSession } from '../hooks/useSession';
import logo from '../assets/thrillylogo.jpg';

export default function Auth({ mode = 'login' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // Als de gebruiker al is ingelogd, stuur hem door naar de homepage
  const { session, loading: sessionLoading } = useSession();
  if (sessionLoading) return null;
  if (session) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate('/');
    }

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Account aangemaakt! Je kunt nu inloggen.');
    }

    setLoading(false);
  };

  return (
    // Achtergrond met paars/roze gradient
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-400">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10">

        {/* Logo en titel */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Thrilly" className="h-14 w-14 rounded-xl object-cover mb-3" />
          <h1 className="text-3xl font-extrabold text-purple-600 tracking-tight">Thrilly</h1>
          <p className="text-gray-400 text-sm mt-1">
            {mode === 'login' ? 'Welkom terug!' : 'Maak een account aan'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email veld */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jij@voorbeeld.nl"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Wachtwoord veld */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Fout- en succesmeldingen */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}

          {/* Submit knop */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Even wachten...' : mode === 'login' ? 'Inloggen' : 'Account aanmaken'}
          </button>
        </form>

        {/* Links naar register/login */}
        <div className="mt-6 text-center text-sm">
          {mode === 'login' && (
            <a href="/register" className="text-purple-500 hover:underline">
              Nog geen account? Registreer hier
            </a>
          )}
          {mode === 'register' && (
            <a href="/login" className="text-purple-500 hover:underline">
              Al een account? Log hier in
            </a>
          )}
        </div>
      </div>
    </div>
  );
}