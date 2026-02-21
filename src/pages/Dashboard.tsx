import {useState, useEffect} from 'react';
import {useAuth} from '../context/AuthContext';
import {Users, Music, Play, CheckCircle, Plus, Mic2} from 'lucide-react';

// --- NOUVEAUX TYPES (Adaptés au JSON léger) ---
interface PlaylistSummary {
    id: string;
    title: string;
    track_count: number;
    covers: string[]; // Tableau d'URLs d'images
    tags: string[];
}

interface PlaylistsResponse {
    [playlistName: string]: PlaylistSummary;
}

const Dashboard = () => {
    const {gameState, apiFetch, refreshGameState} = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // --- ÉTATS LOCAUX ---
    const [players, setPlayers] = useState<string[]>(['', '']);
    const [library, setLibrary] = useState<PlaylistsResponse>({});
    const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([]);

    // --- LOGIQUE JOUEURS (Inchangée) ---
    const handleAddPlayer = () => setPlayers([...players, '']);
    const handlePlayerChange = (index: number, value: string) => {
        const newPlayers = [...players];
        newPlayers[index] = value;
        setPlayers(newPlayers);
    };

    const submitPlayers = async () => {
        const validPlayers = players.filter(p => p.trim() !== '');
        if (validPlayers.length < 2) return alert("Il faut au moins 2 joueurs !");

        setIsLoading(true);
        try {
            const response = await apiFetch('/api/game/init', {
                method: 'POST',
                body: JSON.stringify({players: validPlayers})
            });
            if (response.ok) await refreshGameState();
        } catch (error) {
            console.error("Erreur Init:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOGIQUE PLAYLISTS ---
    useEffect(() => {
        if (gameState?.status === 'PLAYLIST_SELECTION') {
            const fetchPlaylists = async () => {
                try {
                    const res = await apiFetch('/api/game/playlists');
                    if (res.ok) {
                        const data: PlaylistsResponse = await res.json();
                        setLibrary(data);
                    }
                } catch (e) {
                    console.error("Erreur chargement playlists", e);
                }
            };
            fetchPlaylists();
        }
    }, [gameState?.status]);

    const togglePlaylist = (id: string) => {
        setSelectedPlaylistIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const submitPlaylists = async () => {
        if (selectedPlaylistIds.length === 0) return alert("Sélectionnez au moins une source musicale !");
        setIsLoading(true);
        try {
            // On envoie les clés (noms des playlists)
            const response = await apiFetch('/api/game/setup/playlists', {
                method: 'POST',
                body: JSON.stringify({playlist_ids: selectedPlaylistIds})
            });
            if (response.ok) await refreshGameState();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- RENDER ---

    // 1. VUE LOBBY (CASTING) - Inchangée
    if (!gameState || gameState.status === 'LOBBY') {
        return (
            <div
                className="min-h-screen bg-[#0F0F13] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-body">
                <div
                    className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#00F0FF]/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div
                    className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#FF0099]/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="z-10 w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center space-y-2">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1E1E24] border border-[#2D2D35] shadow-[0_0_30px_rgba(0,240,255,0.15)] mb-4">
                            <Users className="w-8 h-8 text-[#00F0FF]"/>
                        </div>
                        <h1 className="font-heading text-4xl uppercase tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                            Le Casting
                        </h1>
                        <p className="text-[#A0A0A5] text-sm font-semibold tracking-wider">
                            PRÉPAREZ VOS JOUEURS
                        </p>
                    </div>

                    <div className="space-y-4">
                        {players.map((player, index) => (
                            <div key={index} className="relative group">
                                <input
                                    type="text"
                                    value={player}
                                    onChange={(e) => handlePlayerChange(index, e.target.value)}
                                    placeholder={`NOM DU JOUEUR ${index + 1}`}
                                    className="w-full bg-[#1E1E24]/60 backdrop-blur-md border border-[#2D2D35] text-white placeholder-[#505055] px-6 py-5 rounded-2xl outline-none focus:border-[#00F0FF] focus:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300 font-heading text-sm tracking-wide uppercase"
                                />
                                <div
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#2D2D35] group-focus-within:bg-[#00F0FF] transition-colors"></div>
                            </div>
                        ))}
                        <button
                            onClick={handleAddPlayer}
                            className="w-full py-4 border border-dashed border-[#2D2D35] text-[#A0A0A5] rounded-2xl hover:bg-[#1E1E24] hover:text-white hover:border-[#A0A0A5] transition-all duration-300 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                        >
                            <Plus size={16}/> Ajouter un challenger
                        </button>
                    </div>

                    <button
                        onClick={submitPlayers}
                        disabled={isLoading}
                        className="w-full py-5 bg-[#00F0FF] text-[#0F0F13] rounded-full font-heading font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'SYNC...' : 'VALIDER LE CASTING'}
                    </button>
                </div>
            </div>
        );
    }

    // 2. VUE PLAYLIST (DECK SELECTION) - MODIFIÉE POUR LA GRILLE 2x2
    if (gameState.status === 'PLAYLIST_SELECTION') {
        const playlistEntries = Object.entries(library);

        return (
            <div className="min-h-screen bg-[#0F0F13] text-white flex flex-col p-6 relative font-body">
                <div
                    className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#FF0099]/10 rounded-full blur-[120px] pointer-events-none"></div>

                <header className="mb-8 z-10 pt-4 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <Music className="text-[#FF0099] drop-shadow-[0_0_10px_rgba(255,0,153,0.5)]" size={28}/>
                        <h1 className="font-heading text-2xl uppercase tracking-widest text-white">Le Deck</h1>
                    </div>
                    <p className="text-[#A0A0A5] text-xs font-bold uppercase tracking-widest pl-1">
                        Composez la pioche musicale
                    </p>
                </header>

                <div className="flex-1 z-10 grid grid-cols-2 gap-4 pb-32 content-start">
                    {playlistEntries.map(([name, summary]) => {
                        const isSelected = selectedPlaylistIds.includes(summary.id);

                        // --- NOUVEAU : Préparation des 4 covers ---
                        let displayCovers = summary.covers.slice(0, 4);
                        // Fallback si aucune cover n'existe
                        if (displayCovers.length === 0) {
                            displayCovers = ['https://via.placeholder.com/500x500?text=No+Music'];
                        }

                        // On limite l'affichage à 3 tags max
                        const displayTags = summary.tags.slice(0, 3);

                        return (
                            <div
                                key={summary.id}
                                onClick={() => togglePlaylist(summary.id)}
                                className={`relative group cursor-pointer aspect-square rounded-[24px] overflow-hidden border-2 transition-all duration-300 transform ${
                                    isSelected
                                        ? 'border-[#FF0099] shadow-[0_0_25px_rgba(255,0,153,0.3)] scale-[1.02] z-10 ring-1 ring-[#FF0099]/50'
                                        : 'border-[#2D2D35] bg-[#1E1E24] hover:border-[#A0A0A5] z-0'
                                }`}
                            >
                                {/* --- NOUVEAU : Grille 2x2 pour les covers --- */}
                                <div className="absolute inset-0 w-full h-full grid grid-cols-2 grid-rows-2">
                                    {displayCovers.map((coverUrl, index) => (
                                        <div key={index}
                                             className="relative w-full h-full overflow-hidden border-[0.5px] border-[#0F0F13]">
                                            <img
                                                src={coverUrl}
                                                alt={`${name} cover ${index + 1}`}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Overlay sombre global par-dessus la grille */}
                                <div
                                    className="absolute inset-0 bg-gradient-to-t from-[#0F0F13] via-black/40 to-transparent opacity-90 pointer-events-none"></div>

                                {/* Badge Track Count */}
                                <div
                                    className="absolute top-3 left-3 bg-[#0F0F13]/80 backdrop-blur-md px-2 py-1 rounded-lg border border-[#2D2D35] z-20">
                                    <p className="text-[10px] font-bold text-white flex items-center gap-1">
                                        <Mic2 size={10} className="text-[#FF0099]"/> {summary.track_count}
                                    </p>
                                </div>

                                {/* Infos Playlist */}
                                <div className="absolute bottom-0 left-0 p-4 w-full z-20">
                                    <h3 className={`font-heading font-bold text-sm truncate uppercase tracking-wide mb-2 ${isSelected ? 'text-[#FF0099]' : 'text-white'}`}>
                                        {summary.title || name}
                                    </h3>

                                    <div className="flex flex-wrap gap-1">
                                        {displayTags.map(tag => (
                                            <span key={tag}
                                                  className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#2D2D35] text-[#A0A0A5] uppercase font-bold">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Checkbox Indicator */}
                                {isSelected && (
                                    <div
                                        className="absolute top-3 right-3 bg-[#FF0099] text-white rounded-full p-1 shadow-[0_0_15px_#FF0099] animate-in zoom-in duration-200 z-20">
                                        <CheckCircle size={18} strokeWidth={3}/>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {playlistEntries.length === 0 && !isLoading && (
                        <div className="col-span-2 flex flex-col items-center justify-center py-20 text-[#2D2D35]">
                            <Music size={48} className="mb-4 opacity-50"/>
                            <p className="text-[#A0A0A5] font-heading uppercase text-sm">Aucune playlist disponible</p>
                        </div>
                    )}
                </div>

                {/* Footer Fixe */}
                <div
                    className="fixed bottom-0 left-0 w-full p-6 bg-[#0F0F13]/90 backdrop-blur-xl border-t border-[#2D2D35] z-50">
                    <button
                        onClick={submitPlaylists}
                        disabled={isLoading || selectedPlaylistIds.length === 0}
                        className="w-full py-5 bg-[#FF0099] text-white rounded-full font-heading font-black text-lg uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(255,0,153,0.4)] disabled:opacity-20 disabled:shadow-none disabled:bg-[#2D2D35] disabled:cursor-not-allowed"
                    >
                        <Play fill="currentColor" size={20}/>
                        {isLoading ? 'INIT...' : `LANCER (${selectedPlaylistIds.length})`}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F0F13] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#2D2D35] border-t-[#00F0FF] rounded-full animate-spin"></div>
        </div>
    );
};

export default Dashboard;