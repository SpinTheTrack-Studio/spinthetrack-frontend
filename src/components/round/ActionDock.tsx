import {Play, Pause, Eye, Check, X} from 'lucide-react';

export const ActionDock = ({
                               localPhase,
                               isPlaying,
                               isLoadingAudio,
                               isSubmitting,
                               submittedAction,
                               togglePlay,
                               handleReveal,
                               handleValidation
                           }: any) => {
    return (
        <div className="w-full px-4 pb-4">
            {localPhase === 'PLAY' ? (
                <div className="flex gap-4">
                    <button onClick={togglePlay} disabled={isLoadingAudio}
                            className="flex-1 py-5 bg-white text-black rounded-2xl font-heading font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl disabled:opacity-50">
                        {isLoadingAudio ? '...' : isPlaying ? <><Pause fill="black" size={24}/> PAUSE</> : <><Play
                            fill="black" size={24}/> ÉCOUTER</>}
                    </button>
                    <button onClick={handleReveal}
                            className="px-6 py-5 bg-[#1E1E24] border border-[#2D2D35] text-white rounded-2xl active:scale-95 transition-all hover:border-[#A0A0A5] shadow-xl">
                        <Eye size={28}/>
                    </button>
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500 h-16 w-full">
                    {isSubmitting && submittedAction !== null ? (
                        <div
                            className={`w-full h-full rounded-full border-2 flex items-center justify-center transition-all duration-300 animate-in zoom-in-95 ${
                                submittedAction
                                    ? 'bg-[#4CD964]/10 border-[#4CD964] text-[#4CD964] shadow-[0_0_20px_rgba(76,217,100,0.3)] animate-pulse'
                                    : 'bg-[#FF3B30]/10 border-[#FF3B30] text-[#FF3B30] shadow-[0_0_20px_rgba(255,59,48,0.3)] animate-pulse'
                            }`}>
                            <div className="flex items-center gap-3">
                                {submittedAction ? <Check size={24} className="animate-bounce"/> :
                                    <X size={24} className="animate-bounce"/>}
                                <span className="font-heading font-black uppercase tracking-widest text-lg mt-0.5">
                                    {submittedAction ? 'Validé !' : 'Raté...'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 h-full">
                            <button onClick={() => handleValidation(false)}
                                    className="h-full bg-[#121212]/80 backdrop-blur-sm border-2 border-[#FF3B30]/50 text-[#FF3B30] rounded-full font-heading font-black uppercase tracking-[0.1em] active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#FF3B30] hover:text-white hover:border-[#FF3B30] shadow-[0_0_15px_rgba(255,59,48,0.15)] hover:shadow-[0_0_25px_rgba(255,59,48,0.4)]">
                                <X size={24} strokeWidth={3}/>
                                <span className="text-sm mt-0.5">ÉCHEC</span>
                            </button>
                            <button onClick={() => handleValidation(true)}
                                    className="h-full bg-[#121212]/80 backdrop-blur-sm border-2 border-[#4CD964]/50 text-[#4CD964] rounded-full font-heading font-black uppercase tracking-[0.1em] active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#4CD964] hover:text-white hover:border-[#4CD964] shadow-[0_0_15px_rgba(76,217,100,0.15)] hover:shadow-[0_0_25px_rgba(76,217,100,0.4)]">
                                <Check size={24} strokeWidth={3}/>
                                <span className="text-sm mt-0.5">SUCCÈS</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};