import {useState, useRef, useEffect} from 'react';
import {useAuth} from '../context/AuthContext';
import {Disc, Mic2, Zap, Ear, LogOut} from 'lucide-react';

import {PhaseIntro} from '../components/round/PhaseIntro';
import {ChallengeCard} from '../components/round/ChallengeCard';
import {ActionDock} from '../components/round/ActionDock';
import {PhaseFinished} from '../components/round/PhaseFinished';
import {EndGameModal} from '../components/round/EndGameModal';

const Round = () => {
    const {gameState, apiFetch, refreshGameState} = useAuth();

    const [localPhase, setLocalPhase] = useState<'INTRO' | 'PLAY' | 'REVEAL'>('INTRO');
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedAction, setSubmittedAction] = useState<boolean | null>(null);

    // L'état de notre modale de sortie
    const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Refs pour le hack du volume sur iOS (Web Audio API)
    const audioCtxRef = useRef<AudioContext | any>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    const player = gameState?.players[gameState?.current_player_index || 0];
    const challenge = gameState?.current_challenge;

    useEffect(() => {
        if (gameState?.status === 'ROUND_INTRO') {
            setLocalPhase('INTRO');
            setIsPlaying(false);
            setAudioUrl(null);
            setIsSubmitting(false);
            setSubmittedAction(null);
            setIsQuitModalOpen(false);
        }
    }, [gameState?.status, gameState?.current_round, gameState?.current_player_index]);

    useEffect(() => {
        if (challenge?.stream_url) {
            const loadAudio = async () => {
                setIsLoadingAudio(true);
                try {
                    const res = await apiFetch(challenge.stream_url);
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    setAudioUrl(url);
                } catch (e) {
                    console.error("Erreur chargement audio", e);
                } finally {
                    setIsLoadingAudio(false);
                }
            };
            loadAudio();
        }
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [challenge?.track_id]);

    const startTurn = () => setLocalPhase('PLAY');

    const togglePlay = () => {
        if (!audioRef.current) return;

        // --- CONTOURNEMENT VOLUME IOS (Web Audio API) ---
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioCtxRef.current = new AudioContext();

            gainNodeRef.current = audioCtxRef.current.createGain();

            const source = audioCtxRef.current.createMediaElementSource(audioRef.current);
            source.connect(gainNodeRef.current);

            if (gainNodeRef.current) {
                gainNodeRef.current.connect(audioCtxRef.current.destination);
            }
        }

        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        if (challenge?.mode === 'HUMMER' && gainNodeRef.current) {
            gainNodeRef.current.gain.value = 0.05; // 5% de volume
        } else if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = 1.0;  // 100% de volume
        }
        // ------------------------------------------------

        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const handleReveal = () => {
        setLocalPhase('REVEAL');
        if (audioRef.current) {
            audioRef.current.playbackRate = 1.0;
            audioRef.current.preservesPitch = true;

            // On remet le son à fond pour la révélation
            if (gainNodeRef.current) {
                gainNodeRef.current.gain.value = 1.0;
            }

            if (!isPlaying) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleValidation = async (success: boolean) => {
        setSubmittedAction(success);
        setIsSubmitting(true);
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);

        try {
            const response = await apiFetch('/api/game/round/next', {
                method: 'POST', body: JSON.stringify({win: success})
            });
            if (response.ok) await refreshGameState();
            else {
                setIsSubmitting(false);
                setSubmittedAction(null);
            }
        } catch (error) {
            console.error("Erreur validation", error);
            setIsSubmitting(false);
            setSubmittedAction(null);
        }
    };

    const handleAudioSetup = (e: React.SyntheticEvent<HTMLAudioElement>) => {
        const audio = e.currentTarget;

        if (challenge?.mode === 'MAESTRO' && challenge.lyrics_challenge) {
            audio.currentTime = challenge.lyrics_challenge.start_time;
        }
        if (challenge?.mode === 'TWISTED' && challenge.playback_speed) {
            audio.playbackRate = challenge.playback_speed;
            audio.preservesPitch = false;
        } else {
            audio.playbackRate = 1.0;
            audio.preservesPitch = true;
        }
    };

    const handleTimeUpdate = (e: React.SyntheticEvent<HTMLAudioElement>) => {
        const audio = e.currentTarget;
        if (localPhase === 'PLAY' && challenge?.mode === 'MAESTRO' && challenge.lyrics_challenge) {
            if (audio.currentTime >= challenge.lyrics_challenge.stop_time) {
                audio.pause();
                setIsPlaying(false);
                audio.currentTime = challenge.lyrics_challenge.start_time;
            }
        }
    };

    const getModeConfig = (mode: string) => {
        switch (mode) {
            case 'EXPERT':
                return {color: 'text-yellow-400', border: 'border-yellow-400', bgGlow: 'bg-yellow-400/20', icon: Disc};
            case 'MAESTRO':
                return {color: 'text-pink-500', border: 'border-pink-500', bgGlow: 'bg-pink-500/20', icon: Mic2};
            case 'TWISTED':
                return {color: 'text-cyan-400', border: 'border-cyan-400', bgGlow: 'bg-cyan-400/20', icon: Zap};
            case 'HUMMER':
                return {color: 'text-[#39FF14]', border: 'border-[#39FF14]', bgGlow: 'bg-[#39FF14]/20', icon: Ear};
            default:
                return {color: 'text-white', border: 'border-white', bgGlow: 'bg-white/10', icon: Disc};
        }
    };

    if (gameState?.status === 'FINISHED') {
        return <PhaseFinished/>;
    }

    if (!gameState || !challenge) return null;

    const theme = getModeConfig(challenge.mode);

    return (
        <div
            className="fixed inset-0 bg-[#0F0F13] text-white flex flex-col font-body overflow-x-hidden overflow-y-auto"
            style={{
                paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
                paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
                paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
                paddingRight: 'max(1.5rem, env(safe-area-inset-right))'
            }}
        >
            <div
                className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${theme.bgGlow.replace('/20', '/10')}`}></div>

            <header className="relative z-10 flex justify-between items-center mb-4 w-full flex-shrink-0">
                <div className="flex flex-col mt-1">
                    <span className="text-[10px] text-[#A0A0A5] uppercase tracking-[0.2em] font-bold">
                        Round {gameState.current_round}
                    </span>
                    <span
                        className="text-[12px] font-heading text-cyan-400 uppercase tracking-tighter">Live Session</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-[#A0A0A5] uppercase tracking-wider font-bold">Score</span>
                        <span
                            className="font-heading font-black text-2xl text-white leading-none">{player?.score}</span>
                    </div>

                    <div className="h-6 w-[1px] bg-[#2D2D35] mx-1"></div>

                    <button
                        onClick={() => setIsQuitModalOpen(true)}
                        className="p-2 text-[#505055] hover:text-[#EC4899] transition-all duration-300 group outline-none"
                        aria-label="Quitter la partie"
                    >
                        <LogOut size={22} strokeWidth={2}
                                className="group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]"/>
                    </button>
                </div>
            </header>

            {localPhase === 'INTRO' && (
                <PhaseIntro player={player} theme={theme} startTurn={startTurn} isLoadingAudio={isLoadingAudio}/>
            )}

            {localPhase !== 'INTRO' && (
                <main className="flex-1 flex flex-col w-full max-w-sm mx-auto relative z-10">
                    <div className="flex-grow"></div>

                    <div className="w-full flex flex-col items-center gap-8 flex-shrink-0">
                        <ChallengeCard
                            challenge={challenge}
                            theme={theme}
                            localPhase={localPhase}
                            isPlaying={isPlaying}
                            setIsPlaying={setIsPlaying}
                            audioUrl={audioUrl}
                            audioRef={audioRef}
                            handleAudioSetup={handleAudioSetup}
                            handleTimeUpdate={handleTimeUpdate}
                        />

                        <ActionDock
                            localPhase={localPhase}
                            isPlaying={isPlaying}
                            isLoadingAudio={isLoadingAudio}
                            isSubmitting={isSubmitting}
                            submittedAction={submittedAction}
                            togglePlay={togglePlay}
                            handleReveal={handleReveal}
                            handleValidation={handleValidation}
                        />
                    </div>

                    <div className="flex-grow min-h-[1rem]"></div>
                </main>
            )}

            <EndGameModal
                isOpen={isQuitModalOpen}
                onClose={() => setIsQuitModalOpen(false)}
            />
        </div>
    );
};

export default Round;