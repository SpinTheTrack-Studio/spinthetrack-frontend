import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, ArrowRight, Loader2, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. IMPORT DE USENAVIGATE

export const PhaseFinished = () => {
    const { gameState, apiFetch, refreshGameState } = useAuth();
    const [isEnding, setIsEnding] = useState(false);

    // 2. INITIALISATION DU ROUTEUR
    const navigate = useNavigate();

    if (!gameState) return null;

    const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

    const handleEndGame = async () => {
        setIsEnding(true);
        try {
            const response = await apiFetch('/api/game/end', { method: 'POST' });

            if (response.ok) {
                // Optionnel : on rafraîchit le state pour que l'app "oublie" la partie
                await refreshGameState().catch(() => {});

                // 3. REDIRECTION EXPLICITE VERS LE DASHBOARD
                navigate('/');
            } else {
                setIsEnding(false);
            }
        } catch (error) {
            console.error("Erreur lors de la fin de partie", error);
            setIsEnding(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0F0F13] text-white flex flex-col font-body overflow-hidden">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[150vw] h-[50vh] rounded-b-[100%] blur-[120px] pointer-events-none bg-yellow-500/10"></div>

            <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 py-10 relative z-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="flex flex-col items-center text-center shrink-0 mb-10">
                    <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-400/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
                        <Trophy size={40} className="text-yellow-400 animate-pulse" />
                    </div>
                    <h1 className="font-heading text-4xl uppercase tracking-tighter text-white drop-shadow-2xl mb-2">
                        Partie Terminée
                    </h1>
                    <p className="text-[#A0A0A5] text-sm uppercase tracking-widest">Classement final</p>
                </div>

                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4">
                    {sortedPlayers.map((player, index) => {
                        const isWinner = index === 0;
                        return (
                            <div key={player.name} className={`flex items-center justify-between p-5 rounded-3xl border-2 transition-all ${isWinner ? 'bg-yellow-400/10 border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.15)] scale-100' : 'bg-[#1E1E24]/50 border-white/5 scale-[0.98] opacity-80'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-heading text-2xl ${isWinner ? 'bg-yellow-400 text-black shadow-lg' : 'bg-[#2D2D35] text-white'}`}>
                                        {isWinner ? <Crown size={24} className="mb-0.5" /> : index + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`font-bold text-xl uppercase tracking-wide ${isWinner ? 'text-yellow-400' : 'text-white'}`}>{player.name}</span>
                                        {/* Avatar (Si existant et différent de default) */}
                                        {player.avatar && player.avatar !== "default" && (
                                            <span className="text-sm opacity-80">{player.avatar}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end justify-center">
                                    <span className={`font-heading font-black text-3xl leading-none ${isWinner ? 'text-white' : 'text-[#A0A0A5]'}`}>{player.score}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-[#A0A0A5]">Pts</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="w-full shrink-0 pt-6 mt-auto">
                    <button onClick={handleEndGame} disabled={isEnding} className="w-full h-[72px] rounded-[24px] bg-white text-black font-heading font-black text-xl uppercase tracking-[0.1em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 disabled:opacity-80">
                        {isEnding ? <><Loader2 size={24} className="animate-spin" /> FERMETURE...</> : <><ArrowRight size={24} strokeWidth={3} /> RETOUR MENU</>}
                    </button>
                </div>
            </main>
        </div>
    );
};