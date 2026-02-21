import {ArrowRight} from 'lucide-react';

export const PhaseIntro = ({player, theme, startTurn, isLoadingAudio}: any) => {
    return (
        <main
            className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 text-center">
            <div className="mb-12 relative">
                <div className={`absolute inset-0 ${theme.bgGlow} blur-3xl rounded-full animate-pulse`}></div>
                <div
                    className="relative w-40 h-40 rounded-full border-4 border-[#2D2D35] bg-[#1E1E24] flex items-center justify-center shadow-2xl">
                    <span className="font-heading text-6xl uppercase text-white">{player?.name?.charAt(0)}</span>
                </div>
            </div>
            <div className="space-y-4 mb-12">
                <h2 className="text-[#A0A0A5] text-lg uppercase tracking-[0.3em] font-semibold">C'est prêt !</h2>
                <p className="text-white text-xl px-4 leading-relaxed">
                    Passez le téléphone à <br/>
                    <span
                        className="font-heading text-4xl text-[#00F0FF] uppercase tracking-wider block mt-2">{player?.name}</span>
                </p>
            </div>
            <button
                onClick={startTurn}
                disabled={isLoadingAudio}
                className="group relative px-12 py-5 rounded-full bg-white text-black font-heading font-black text-xl uppercase tracking-[0.1em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] disabled:opacity-80"
            >
                {isLoadingAudio ? 'Chargement...' : 'Je suis prêt(e)'}
                {!isLoadingAudio &&
                    <ArrowRight className="inline-block ml-3 group-hover:translate-x-2 transition-transform"/>}
            </button>
        </main>
    );
};