import React, {useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {useNavigate} from 'react-router-dom';

const Login = () => {
    const {login} = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // Appel à ton Backend
            // Ton backend se chargera de simuler le navigateur, résoudre Akamai et stocker l'ARL
            await login(email, password);

            // Si le backend répond 200, on entre dans le jeu
            navigate('/');
        } catch (err) {
            setError("Échec de l'authentification. Vérifiez vos accès Deezer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-white p-4">
            {/* Ambiance visuelle GDD */}
            <div
                className="absolute top-0 left-0 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div
                className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>

            <div className="z-10 w-full max-w-md bg-[#1E1E1E] p-10 rounded-3xl shadow-2xl border border-gray-800">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black tracking-tighter italic">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
              SPIN
            </span>
                        <span className="text-white">THE</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              TRACK
            </span>
                    </h1>
                    <p className="text-gray-500 text-[10px] mt-3 uppercase tracking-[0.3em] font-bold">
                        Maître du Jeu • Session Dédiée
                    </p>
                </div>

                {error && (
                    <div
                        className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-xs text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1 tracking-widest">
                            Identifiant Deezer
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            className="w-full px-5 py-4 bg-[#252525] border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all text-white placeholder-gray-600"
                            required
                        />
                    </div>

                    <div>
                        <label
                            className="block text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1 tracking-widest">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-5 py-4 bg-[#252525] border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all text-white placeholder-gray-600"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-5 font-black rounded-2xl uppercase tracking-widest shadow-2xl transition-all transform 
              ${isSubmitting
                            ? 'bg-gray-800 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-br from-pink-600 to-purple-700 hover:scale-[1.02] active:scale-95 shadow-pink-500/10 hover:shadow-pink-500/30'
                        }`}
                    >
                        {isSubmitting ? 'Synchronisation...' : 'Lancer la partie'}
                    </button>
                </form>

                <p className="mt-10 text-center text-[9px] text-gray-600 uppercase tracking-tighter leading-relaxed">
                    En vous connectant, vous autorisez le serveur SpinTheTrack <br/> à piloter votre session musicale
                    via Deezer.
                </p>
            </div>
        </div>
    );
};

export default Login;