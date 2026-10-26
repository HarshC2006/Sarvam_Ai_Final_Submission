import React from 'react';
import type { CaseState, Language, OperatingMode } from '../types';
import { RefreshCw, Mic } from 'lucide-react';

interface HeaderProps {
  state: CaseState | null;
  onSetMode: (mode: OperatingMode) => void;
  onSetLanguage: (lang: Language) => void;
  onLoadScenario: (scenarioKey: string) => void;
  onOpenVoiceModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  onSetMode,
  onSetLanguage,
  onLoadScenario,
  onOpenVoiceModal,
}) => {
  if (!state) return null;

  const isLive = state.mode === 'live';
  const isHindi = state.language === 'hi-IN';

  return (
    <header className="bg-white/90 border-b border-stone-200 sticky top-0 z-40 backdrop-blur-sm">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo & Civic Tagline */}
          <div className="flex items-center gap-3.5">
            {/* Minimalist Forest Green Brand Mark */}
            <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-ivory-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="m9 15 2 2 4-4"></path>
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-stone-900 flex items-center gap-1.5">
                  आवेदन <span className="text-forest-700 text-sm font-semibold tracking-normal">· Aavedan</span>
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-forest-50 text-forest-700 border border-forest-100 uppercase tracking-wide">
                  Powered by Sarvam AI
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {isHindi 
                  ? "दस्तावेज़ों को आवेदन में बदलें। आवश्यकताओं को समझें, कमियों को दूर करें।" 
                  : "Turn your documents into an application. Understand requirements, resolve blockers."}
              </p>
            </div>
          </div>

          {/* Controls: Mode, Language & Scenarios */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Live vs Fixture Mode Toggle */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
              <button
                onClick={() => onSetMode('fixture')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  !isLive ? 'bg-white text-stone-900 border border-stone-200 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Fixture Demo
              </button>
              <button
                onClick={() => onSetMode('live')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  isLive ? 'bg-forest-700 text-white font-semibold shadow-sm' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-white animate-pulse' : 'bg-stone-400'}`}></span>
                Live Sarvam
              </button>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
              <button
                onClick={() => onSetLanguage('hi-IN')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                  isHindi ? 'bg-white text-stone-900 border border-stone-200 shadow-sm font-semibold' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                🇮🇳 हिन्दी
              </button>
              <button
                onClick={() => onSetLanguage('en-IN')}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                  !isHindi ? 'bg-white text-stone-900 border border-stone-200 shadow-sm font-semibold' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                🇬🇧 English
              </button>
            </div>

            {/* Bulbul Interactive Voice Mode Trigger */}
            <button
              onClick={onOpenVoiceModal}
              className="px-3.5 py-1.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition transform active:scale-95 group"
              title="Open Bulbul Voice Assistant (Sarvam 105B + Bulbul TTS)"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <Mic className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition" />
              <span>{isHindi ? "आवाज़ में पूछें" : "Ask Bulbul"}</span>
            </button>

            {/* Scenario Quick Buttons */}
            <div className="hidden sm:flex items-center gap-1.5 bg-stone-100/90 p-1 rounded-xl border border-stone-200 text-xs">
              <span className="text-stone-500 px-2 font-mono text-[11px]">Cases:</span>
              <button
                onClick={() => onLoadScenario('asha_incomplete')}
                className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-medium transition"
                title="Asha Sharma: 75% Complete (Missing Certificate)"
              >
                ⚡ Case 1 (Hero 75%)
              </button>
              <button
                onClick={() => onLoadScenario('asha_complete')}
                className="px-2.5 py-1 rounded-lg bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 transition"
                title="Asha Sharma: 100% Complete"
              >
                Case 2 (100%)
              </button>
              <button
                onClick={() => onLoadScenario('rohan_ineligible')}
                className="px-2.5 py-1 rounded-lg bg-white text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                title="Rohan Mehta: Income > 2.5L"
              >
                Case 3 (Ineligible)
              </button>
              <button
                onClick={() => onLoadScenario('conflicting_names')}
                className="px-2.5 py-1 rounded-lg bg-white text-purple-700 hover:bg-purple-50 border border-purple-200 transition"
                title="Conflicting Documents"
              >
                Case 4 (Conflict)
              </button>
            </div>

            <button
              onClick={() => onLoadScenario('asha_incomplete')}
              className="p-2 rounded-xl bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200 transition shadow-sm"
              title="Reset Case"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Global Progress Bar Strip */}
        <div className="mt-3.5 pt-3 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex-1 max-w-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-stone-700">
                Grant Progress: <strong className="text-stone-900">{state.progress_met_count} of {state.progress_total_count} Conditions Met</strong>
              </span>
              <span className="font-bold font-mono text-forest-700">{state.progress_percentage}%</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-forest-700 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${state.progress_percentage}%` }}
              ></div>
            </div>
          </div>

          {/* Active Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-stone-500 uppercase">Programme:</span>
            <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 font-medium text-xs">
              {state.programme_name} ({state.grant_amount})
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};
