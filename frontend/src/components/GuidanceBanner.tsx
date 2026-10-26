import React, { useState } from 'react';
import type { CaseState } from '../types';
import { Volume2, Mic, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface GuidanceBannerProps {
  state: CaseState;
  onPlayAdvice: () => void;
  onClarify: (text: string) => void;
  onResolveHero: () => void;
  isPlayingAudio: boolean;
  onOpenVoiceModal?: () => void;
}

export const GuidanceBanner: React.FC<GuidanceBannerProps> = ({
  state,
  onPlayAdvice,
  onClarify,
  onResolveHero,
  isPlayingAudio,
  onOpenVoiceModal,
}) => {
  const [inputText, setInputText] = useState('');
  const isHindi = state.language === 'hi-IN';
  const adviceText = isHindi ? state.next_action_hi : state.next_action_en;
  const isComplete = state.progress_percentage === 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onClarify(inputText.trim());
      setInputText('');
    }
  };

  const handleSimulateVoice = () => {
    const defaultVoice = isHindi
      ? "हमारे परिवार की समस्त स्रोतों से वार्षिक आय 1.8 लाख रुपये है।"
      : "Our annual household income from all sources is 1.8 lakh rupees.";
    onClarify(defaultVoice);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm mb-6 relative overflow-hidden">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        
        {/* Guidance Text & Status Indicator */}
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
            isComplete ? 'bg-forest-50 text-forest-700 border border-forest-100' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {isComplete ? <CheckCircle2 className="w-5 h-5 text-forest-700" /> : <AlertTriangle className="w-5 h-5 text-amber-700" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-stone-500">
                {isHindi ? "अगला आवश्यक कदम (Next Action)" : "Next Required Action"}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isComplete ? 'bg-forest-50 text-forest-700 border border-forest-100' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {isComplete ? 'Ready for Review' : 'Action Needed'}
              </span>
            </div>
            
            <p className="text-sm sm:text-base font-semibold text-stone-900 mt-1 leading-snug">
              {adviceText}
            </p>
          </div>
        </div>

        {/* Audio Controls & Hero Resolution Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Bulbul TTS Audio Button */}
          <button
            onClick={onPlayAdvice}
            disabled={isPlayingAudio}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-xs font-semibold text-stone-800 flex items-center gap-2 transition shadow-sm"
          >
            <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'text-forest-700 animate-pulse' : 'text-stone-600'}`} />
            <span>{isHindi ? "सुनो (Bulbul TTS)" : "Listen (Bulbul TTS)"}</span>
          </button>

          {/* Ask Bulbul Voice Doubt Button */}
          {onOpenVoiceModal && (
            <button
              onClick={onOpenVoiceModal}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 flex items-center gap-2 transition shadow-xs"
              title="Ask doubts interactively using voice"
            >
              <Mic className="w-4 h-4 text-amber-700 animate-pulse" />
              <span>{isHindi ? "बुलबुल से पूछें (Voice Doubt)" : "Ask Bulbul (Voice Doubt)"}</span>
            </button>
          )}

          {/* Quick Hero Resolution Trigger (if incomplete) */}
          {!isComplete && (
            <button
              onClick={onResolveHero}
              className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition transform active:scale-95"
            >
              <span>⚡ Upload Income Certificate</span>
            </button>
          )}

        </div>

      </div>

      {/* Input Clarification Strip (Saaras Voice / Typed Input) */}
      <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="text-stone-600 flex items-center gap-2">
          <span className="font-medium text-stone-800">Answer Clarification:</span>
          <span className="text-[11px] text-stone-500 italic">
            {isHindi ? "*मौखिक दावा दर्ज होगा, किंतु प्रमाणपत्र के बिना शर्त पूरी नहीं मानी जाएगी।" : "*Recorded as user statement; documentary proof still required."}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-md w-full">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isHindi ? "उदा. हमारे परिवार की आय ₹1.8 लाख है..." : "e.g. Our family income is ₹1.8 lakh..."}
            className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-forest-700 focus:bg-white"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 rounded-xl text-xs font-medium text-white transition flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5 text-stone-200" />
            <span>Send</span>
          </button>
          <button
            type="button"
            onClick={handleSimulateVoice}
            className="p-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl text-xs text-stone-700 transition"
            title="Simulate Voice Input via Saaras STT"
          >
            <Mic className="w-4 h-4 text-purple-700" />
          </button>
        </form>
      </div>

    </div>
  );
};
