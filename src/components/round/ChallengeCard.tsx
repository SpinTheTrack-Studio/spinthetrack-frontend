import {Disc} from 'lucide-react';

export const ChallengeCard = ({
                                  challenge,
                                  theme,
                                  localPhase,
                                  audioUrl,
                                  audioRef,
                                  handleAudioSetup,
                                  handleTimeUpdate,
                                  setIsPlaying
                              }: any) => {
    const Icon = theme.icon;

    return (
        <>
            <div className="flex flex-col items-center mb-8 text-center w-full">
                <div
                    className={`p-4 rounded-full border-2 ${theme.border} ${theme.bgGlow.replace('/20', '/10')} mb-6 shadow-lg shadow-black/50`}>
                    <Icon size={44} className={theme.color}/>
                </div>
                <h1 className={`font-heading text-4xl uppercase tracking-tighter ${theme.color} drop-shadow-2xl mb-4`}>
                    {challenge.mode}
                </h1>
                <div className="h-[2px] w-12 bg-[#2D2D35] mb-6"></div>

                <p className="text-white font-bold px-2 text-xl leading-tight">
                    {challenge.question}
                </p>

                {challenge.mode === 'MAESTRO' && localPhase === 'PLAY' && (
                    <p className="text-[#A0A0A5] text-xs uppercase tracking-widest mt-6 animate-pulse">
                        Écoutez attentivement... l'audio va se couper !
                    </p>
                )}
            </div>

            <div className="relative w-full max-w-[320px] aspect-square mb-8">
                <div
                    className={`absolute inset-0 border-2 ${theme.border} rounded-[2rem] bg-[#1E1E24] backdrop-blur-xl flex items-center justify-center transition-all duration-700 z-20 ${localPhase === 'REVEAL' ? 'opacity-0 scale-125 rotate-12 pointer-events-none' : 'opacity-100 shadow-2xl'}`}>
                    <div className="flex flex-col items-center gap-4 opacity-20">
                        <Disc size={80} className="animate-[spin_10s_linear_infinite]"/>
                        <span className="font-heading text-xs tracking-[0.5em] uppercase">Lecture...</span>
                    </div>
                </div>

                <img src={challenge.track_cover} alt="Solution"
                     className={`absolute inset-0 w-full h-full rounded-[2rem] object-cover shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-white/5 transition-all duration-700 transform z-10 ${localPhase === 'REVEAL' ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0'}`}/>

                {audioUrl && (
                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        onLoadedMetadata={handleAudioSetup}
                        onTimeUpdate={handleTimeUpdate}
                    />
                )}
            </div>

            {localPhase === 'REVEAL' && (
                <div className="text-center mb-8 animate-in slide-in-from-bottom-8 fade-in duration-500 w-full">
                    <h2 className="font-heading text-2xl sm:text-3xl uppercase text-white mb-1 leading-none px-4">{challenge.track_title}</h2>
                    <p className="text-[#A0A0A5] font-semibold tracking-widest uppercase text-sm mb-6">{challenge.track_artist}</p>

                    {challenge.mode === 'MAESTRO' && challenge.lyrics_challenge && (
                        <div className="p-6 bg-[#1A1A1E] rounded-3xl border border-white/5 w-full shadow-inner">
                            <p className="text-[10px] text-[#A0A0A5] uppercase font-black mb-3 tracking-[0.2em]">Solution</p>
                            <p className={`text-xl sm:text-2xl text-pink-400 font-bold italic leading-snug ${theme.color}`}>
                                "{challenge.lyrics_challenge.hidden_answer}"
                            </p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};