import React, { useState, useEffect, useRef } from 'react';
import type { CaseState, Language, OperatingMode } from './types';
import { Header } from './components/Header';
import { GuidanceBanner } from './components/GuidanceBanner';
import { RequirementsPanel } from './components/RequirementsPanel';
import { EvidencePanel } from './components/EvidencePanel';
import { ApplicationDraftPanel } from './components/ApplicationDraftPanel';
import { ActivityFeed } from './components/ActivityFeed';
import { Layers, FileSearch, FileCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [state, setState] = useState<CaseState | null>(null);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('income_ceiling');
  const [activeTab, setActiveTab] = useState<'requirements' | 'evidence' | 'draft'>('requirements');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch initial case state
  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error('Failed to load state:', err);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const playBase64Audio = (b64: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setIsPlayingAudio(false);
      audioRef.current.onerror = () => setIsPlayingAudio(false);
    }
    audioRef.current.src = `data:audio/wav;base64,${b64}`;
    setIsPlayingAudio(true);
    audioRef.current.play().catch((e) => {
      console.log('Audio autoplay blocked or failed:', e);
      setIsPlayingAudio(false);
    });
  };

  const handleSetMode = async (mode: OperatingMode) => {
    try {
      const res = await fetch('/api/set-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error('Mode change error:', err);
    }
  };

  const handleSetLanguage = async (lang: Language) => {
    try {
      const res = await fetch('/api/set-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error('Language change error:', err);
    }
  };

  const handleLoadScenario = async (scenarioKey: string) => {
    try {
      const res = await fetch(`/api/load-scenario/${scenarioKey}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        setSelectedRuleId('income_ceiling');
      }
    } catch (err) {
      console.error('Scenario load error:', err);
    }
  };

  const handleResolveHero = async () => {
    try {
      const res = await fetch('/api/resolve-blocker', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setState(data);
        setSelectedRuleId('income_ceiling');
        if (data.last_audio_base64) {
          playBase64Audio(data.last_audio_base64);
        }
      }
    } catch (err) {
      console.error('Resolve blocker error:', err);
    }
  };

  const handlePlayAdvice = async () => {
    try {
      const res = await fetch('/api/speak-advice', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.audio_base64) {
          playBase64Audio(data.audio_base64);
        }
      }
    } catch (err) {
      console.error('Play advice error:', err);
    }
  };

  const handleClarify = async (text: string) => {
    try {
      const res = await fetch('/api/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error('Clarify error:', err);
    }
  };

  const handleUploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setState(data.state);
        }
      }
    } catch (err) {
      console.error('Upload file error:', err);
    }
  };

  const handleExport = () => {
    window.open('/api/export', '_blank');
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center text-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-forest-700 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium text-sm text-stone-600">Loading Aavedan Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100 text-stone-900 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        state={state}
        onSetMode={handleSetMode}
        onSetLanguage={handleSetLanguage}
        onLoadScenario={handleLoadScenario}
      />

      {/* Main Container */}
      <main className="max-w-[1520px] mx-auto w-full flex-1 px-4 sm:px-6 py-6 flex flex-col">
        
        {/* Compact Guidance Hub */}
        <GuidanceBanner
          state={state}
          onPlayAdvice={handlePlayAdvice}
          onClarify={handleClarify}
          onResolveHero={handleResolveHero}
          isPlayingAudio={isPlayingAudio}
        />

        {/* Mobile Tab Switcher (< 1024px) */}
        <div className="lg:hidden flex bg-white p-1 rounded-xl border border-stone-200 mb-4 text-xs font-semibold shadow-sm">
          <button
            onClick={() => setActiveTab('requirements')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'requirements' ? 'bg-forest-700 text-white shadow-sm' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Requirements</span>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'evidence' ? 'bg-forest-700 text-white shadow-sm' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Evidence</span>
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
              activeTab === 'draft' ? 'bg-forest-700 text-white shadow-sm' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Application Draft</span>
          </button>
        </div>

        {/* 3 Connected Panels Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch min-h-[600px]">
          
          {/* Panel 1: Requirements (4 cols) */}
          <div className={`lg:col-span-4 ${activeTab === 'requirements' ? 'block' : 'hidden lg:block'}`}>
            <RequirementsPanel
              checks={state.checks}
              selectedRuleId={selectedRuleId}
              onSelectRule={setSelectedRuleId}
            />
          </div>

          {/* Panel 2: Evidence Inspector (4 cols) */}
          <div className={`lg:col-span-4 ${activeTab === 'evidence' ? 'block' : 'hidden lg:block'}`}>
            <EvidencePanel
              checks={state.checks}
              selectedRuleId={selectedRuleId}
              onResolveHero={handleResolveHero}
              onUploadFile={handleUploadFile}
              uploadedDocs={state.uploaded_documents}
            />
          </div>

          {/* Panel 3: Application Draft (4 cols) */}
          <div className={`lg:col-span-4 ${activeTab === 'draft' ? 'block' : 'hidden lg:block'}`}>
            <ApplicationDraftPanel
              fields={state.draft_fields}
              state={state}
              onExport={handleExport}
            />
          </div>

        </div>

        {/* Audit History & Activity Log */}
        <div className="mt-6">
          <ActivityFeed events={state.audit_history} />
        </div>

      </main>

    </div>
  );
};

export default App;
