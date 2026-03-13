import {useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {useNavigate} from 'react-router-dom';
import {LogOut, Loader2} from 'lucide-react';

interface EndGameModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EndGameModal = ({isOpen, onClose}: EndGameModalProps) => {
    const {apiFetch, refreshGameState} = useAuth();
    const navigate = useNavigate();
    const [isEnding, setIsEnding] = useState(false);

    if (!isOpen) return null;

    const handleEndGame = async () => {
        setIsEnding(true);
        try {
            const response = await apiFetch('/api/game/end', {method: 'POST'});

            if (response.ok) {
                await refreshGameState().catch(() => {
                });
                // Redirection explicite vers le Dashboard
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
        <div
            className="fixed inset-0 z-[100] bg-[#0F0F13]/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div
                className="bg-[#1E1E24] border border-[#2D2D35] rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-300">
                <div
                    className="w-16 h-16 rounded-full bg-[#FF3B30]/10 border-2 border-[#FF3B30]/50 flex items-center justify-center mx-auto mb-6">
                    <LogOut size={32} className="text-[#FF3B30]"/>
                </div>
                <h2 className="font-heading text-2xl uppercase tracking-widest text-white mb-2">Arrêter la partie ?</h2>
                <p className="text-[#A0A0A5] mb-8 text-sm">La partie en cours sera définitivement supprimée. Êtes-vous
                    sûr ?</p>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onClose}
                        disabled={isEnding}
                        className="py-4 rounded-full border border-[#2D2D35] text-white font-heading font-bold uppercase tracking-widest hover:bg-[#2D2D35] transition-all text-xs disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleEndGame}
                        disabled={isEnding}
                        className="py-4 rounded-full bg-[#FF3B30] text-white font-heading font-black uppercase tracking-widest hover:bg-[#FF3B30]/80 shadow-[0_0_20px_rgba(255,59,48,0.4)] transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isEnding ? <Loader2 size={16} className="animate-spin"/> : null}
                        {isEnding ? 'Arrêt...' : 'Quitter'}
                    </button>
                </div>
            </div>
        </div>
    );
};