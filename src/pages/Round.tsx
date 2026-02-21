import {useState, useRef, useEffect} from 'react';
import {useAuth} from '../context/AuthContext';
import {Disc, Mic2, Zap, Ear} from 'lucide-react';

import {PhaseIntro} from '../components/round/PhaseIntro';
import {ChallengeCard} from '../components/round/ChallengeCard';
import {ActionDock} from '../components/round/ActionDock';
import {PhaseFinished} from '../components/round/PhaseFinished';

const Round = () => {
    const {gameState, apiFetch, refreshGameState} = useAuth();

    // --- 1. TOUS LES HOOKS (DOIVENT TOUJOURS S'EXÉCUTER) ---
    const [localPhase, setLocalPhase] = useState<'INTRO' | 'PLAY' | 'REVEAL'>('INTRO');
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittedAction, setSubmittedAction] = useState<boolean | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const player = gameState?.players[gameState.current_player_index];
    const challenge = gameState?.current_challenge;

    useEffect(() => {
        if (gameState?.status === 'ROUND_INTRO') {
            setLocalPhase('INTRO');
            setIsPlaying(false);
            setAudioUrl(null);
            setIsSubmitting(false);
            setSubmittedAction(null);
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

    // --- 2. FONCTIONS ---
    const startTurn = () => setLocalPhase('PLAY');

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const handleReveal = () => {
        setLocalPhase('REVEAL');
        if (audioRef.current) {
            audioRef.current.volume = 1.0;
            audioRef.current.playbackRate = 1.0;
            audioRef.current.preservesPitch = true;
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

        if (challenge?.mode === 'HUMMER' && audioRef.current) {
            audioRef.current.volume = 0.05;
        }
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

    // --- 3. RENDUS CONDITIONNELS (TOUJOURS APRÈS LES HOOKS) ---
    if (gameState?.status === 'FINISHED') {
        return <PhaseFinished/>;
    }

    if (!gameState || !challenge) return null;

    const theme = getModeConfig(challenge.mode);

    // --- 4. AFFICHAGE DE LA PAGE DE JEU ---
    return (
        <div className="min-h-screen bg-[#0F0F13] text-white p-6 flex flex-col font-body relative overflow-hidden">
            <div
                className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${theme.bgGlow.replace('/20', '/10')}`}></div>

            <header className="relative z-10 flex justify-between items-center mb-10">
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#A0A0A5] uppercase tracking-[0.2em] font-bold">
                        Round {gameState.current_round}
                    </span>
                    <span
                        className="text-[12px] font-heading text-cyan-400 uppercase tracking-tighter">Live Session</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-[#A0A0A5] uppercase tracking-wider font-bold">Score</span>
                    <span className="font-heading font-black text-2xl text-white">{player?.score}</span>
                </div>
            </header>

            {localPhase === 'INTRO' && (
                <PhaseIntro
                    player={player}
                    theme={theme}
                    startTurn={startTurn}
                    isLoadingAudio={isLoadingAudio}
                />
            )}

            {localPhase !== 'INTRO' && (
                <main
                    className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-sm mx-auto">

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
                </main>
            )}
        </div>
    );
};

export default Round;