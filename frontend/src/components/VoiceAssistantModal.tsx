import React, { useState, useRef, useEffect } from 'react';
import type { CaseState, Language } from '../types';
import { Mic, MicOff, Volume2, VolumeX, Send, X, Sparkles, HelpCircle, Bot, User } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: CaseState;
  onRefreshState?: () => void;
  onSetLanguage?: (lang: Language) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bulbul';
  text: string;
  audioBase64?: string;
  timestamp: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  state,
  onRefreshState,
  onSetLanguage,
}) => {
  const isHindi = state.language === 'hi-IN';
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'bulbul',
      text: isHindi
        ? 'नमस्ते आशा जी! मैं बुलबुल हूँ, आपकी आवेदन सहायक। आप मुझसे आय प्रमाण पत्र, पात्रता नियमों, या छात्रवृत्ति के किसी भी सवाल के बारे में बोलकर या लिखकर पूछ सकते हैं।'
        : 'Hello! I am Bulbul, your Aavedan voice assistant. You can speak or type any doubt about the income certificate, eligibility criteria, or application status.',
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Play base64 audio helper
  const playAudio = (b64: string, messageId?: string) => {
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
    }
    const player = audioPlayerRef.current;
    player.src = `data:audio/wav;base64,${b64}`;
    setIsPlaying(true);
    if (messageId) setActivePlayingId(messageId);

    player.onended = () => {
      setIsPlaying(false);
      setActivePlayingId(null);
    };
    player.onerror = () => {
      setIsPlaying(false);
      setActivePlayingId(null);
    };

    player.play().catch((err) => {
      console.warn('Audio play failed:', err);
      setIsPlaying(false);
      setActivePlayingId(null);
    });
  };

  const stopAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsPlaying(false);
      setActivePlayingId(null);
    }
  };

  // Submit question to backend
  const handleAskDoubt = async (questionText: string, audioBlob?: Blob) => {
    if (!questionText.trim() && !audioBlob) return;

    const userMsgId = `user_${Date.now()}`;
    const displayQuestion = questionText.trim() || (isHindi ? '🎙️ [ध्वनि संदेश]' : '🎙️ [Voice Audio]');
    
    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: displayQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setIsProcessing(true);
    setInputText('');

    try {
      let res: Response;
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('language', state.language);
        if (questionText) formData.append('question', questionText);
        res = await fetch('/api/voice-doubt', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await fetch('/api/voice-doubt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: questionText,
            language: state.language,
          }),
        });
      }

      if (res.ok) {
        const data = await res.json();
        const bulbulMsgId = `bulbul_${Date.now()}`;
        
        // If transcribed question was returned and differs
        if (data.question && data.question !== displayQuestion && !questionText) {
          setMessages((prev) =>
            prev.map((m) => (m.id === userMsgId ? { ...m, text: data.question } : m))
          );
        }

        const newBulbulMsg: ChatMessage = {
          id: bulbulMsgId,
          sender: 'bulbul',
          text: data.answer,
          audioBase64: data.audio_base64,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, newBulbulMsg]);

        // Auto-play Bulbul's spoken answer
        if (data.audio_base64) {
          playAudio(data.audio_base64, bulbulMsgId);
        }

        if (onRefreshState) {
          onRefreshState();
        }
      } else {
        throw new Error('Failed to fetch Bulbul response');
      }
    } catch (err) {
      console.error('Bulbul voice doubt error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'bulbul',
          text: isHindi
            ? 'क्षमा करें, आवाज़ सेवा से संपर्क करने में कठिनाई हुई। कृपया पुनः प्रयास करें।'
            : 'Sorry, I encountered an issue contacting the voice engine. Please try again.',
          timestamp: 'Now',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Microphone recording handlers
  const startRecording = async () => {
    try {
      stopAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleAskDoubt('', audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone access unavailable or denied:', err);
      // Fallback: simulate an immediate sample voice doubt
      const sampleQuestion = isHindi
        ? 'आय प्रमाण पत्र तहसील से कैसे बनवाएं?'
        : 'How do I obtain the certified income certificate from the Tehsildar?';
      handleAskDoubt(sampleQuestion);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Preset question pills
  const presetQuestions = isHindi
    ? [
        'आय प्रमाण पत्र कहाँ से और कैसे बनवाएं?',
        'आवेदन 75% पर क्यों रुका है?',
        'क्या शपथ पत्र (Affidavit) मान्य होगा?',
        'उड़ान छात्रवृत्ति के लिए क्या पात्रता है?',
      ]
    : [
        'How can I get the Tehsildar income certificate?',
        'Why is my application stuck at 75%?',
        'Can an affidavit satisfy the income requirement?',
        'What are the eligibility criteria for Udaan Grant?',
      ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl h-[92vh] max-h-[760px] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest-700 text-white flex items-center justify-center shadow-sm relative">
              <Sparkles className="w-5 h-5 text-amber-300" />
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-forest-500"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  {isHindi ? 'बुलबुल वॉयस असिस्टेंट' : 'Bulbul Voice Assistant'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-50 text-forest-700 border border-forest-100">
                  Sarvam 105B + Bulbul:v3
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {isHindi ? 'योजना के नियम, प्रमाण पत्र और समाधान पर आवाज़ में बात करें' : 'Talk with Bulbul about rules, certificates & eligibility'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            {onSetLanguage && (
              <div className="flex bg-stone-200 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => onSetLanguage('hi-IN')}
                  className={`px-2 py-1 rounded-md transition ${isHindi ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'}`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => onSetLanguage('en-IN')}
                  className={`px-2 py-1 rounded-md transition ${!isHindi ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'}`}
                >
                  EN
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 transition"
              title="Close Voice Assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Voice Status / Visualizer Bar */}
        <div className="px-5 py-3.5 bg-forest-900 text-white flex items-center justify-between border-b border-forest-800">
          <div className="flex items-center gap-3">
            {isRecording ? (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs font-semibold text-rose-200">
                  {isHindi ? 'बुलबुल सुन रही है... (बोलिए)' : 'Listening... Speak your doubt'}
                </span>
              </div>
            ) : isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-semibold text-amber-200">
                  {isHindi ? 'सरवम 105B उत्तर तैयार कर रहा है...' : 'Sarvam 105B & Bulbul synthesizing...'}
                </span>
              </div>
            ) : isPlaying ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-end gap-1 h-4">
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3"></span>
                  <span className="w-1 bg-amber-300 rounded-full animate-bounce h-4" style={{ animationDelay: '0.15s' }}></span>
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0.3s' }}></span>
                  <span className="w-1 bg-amber-200 rounded-full animate-bounce h-4" style={{ animationDelay: '0.2s' }}></span>
                </div>
                <span className="text-xs font-semibold text-amber-200">
                  {isHindi ? 'बुलबुल बोल रही है...' : 'Bulbul is speaking aloud...'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-stone-300 text-xs">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>
                  {isHindi ? 'माइक दबाकर बोलें या नीचे दिए गए प्रश्न चुनें' : 'Press mic to speak or select a doubt below'}
                </span>
              </div>
            )}
          </div>

          {isPlaying && (
            <button
              onClick={stopAudio}
              className="px-2.5 py-1 bg-forest-800 hover:bg-forest-700 text-stone-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>{isHindi ? 'रोकें' : 'Stop'}</span>
            </button>
          )}
        </div>

        {/* Conversation Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-stone-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isThisPlaying = activePlayingId === msg.id && isPlaying;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-stone-800 text-white'
                      : 'bg-forest-700 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-amber-300" />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-stone-900 text-white rounded-tr-xs'
                      : 'bg-white border border-stone-200 text-stone-800 shadow-sm rounded-tl-xs'
                  }`}
                >
                  <p className="font-normal">{msg.text}</p>

                  <div className="mt-2.5 pt-2 border-t border-stone-200/50 flex items-center justify-between text-[11px] text-stone-400">
                    <span>{msg.timestamp}</span>

                    {/* Replay audio button if available */}
                    {!isUser && msg.audioBase64 && (
                      <button
                        onClick={() => playAudio(msg.audioBase64!, msg.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
                          isThisPlaying
                            ? 'bg-forest-700 text-white font-semibold'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                        }`}
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isThisPlaying ? 'animate-pulse' : ''}`} />
                        <span>{isThisPlaying ? (isHindi ? 'बोल रही है...' : 'Speaking...') : (isHindi ? 'आवाज़ सुनें' : 'Listen')}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-forest-700 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-amber-300 animate-spin" />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm text-xs text-stone-600 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-forest-700 animate-ping"></div>
                <span>{isHindi ? 'बुलबुल जानकारी जुटा रही है...' : 'Bulbul is reasoning and generating voice answer...'}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-5 py-2.5 bg-stone-50 border-t border-stone-200">
          <div className="text-[11px] font-semibold text-stone-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-forest-700" />
            <span>{isHindi ? 'त्वरित प्रश्न (Quick Doubts):' : 'Suggested Doubts:'}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presetQuestions.map((chip, idx) => (
              <button
                key={idx}
                disabled={isProcessing || isRecording}
                onClick={() => handleAskDoubt(chip)}
                className="px-2.5 py-1 bg-white hover:bg-forest-50 border border-stone-200 hover:border-forest-300 rounded-lg text-[11px] text-stone-700 hover:text-forest-900 transition font-medium text-left shadow-2xs disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Input & Voice Trigger Bar */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center gap-2.5">
          
          {/* Main Record Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`p-3.5 rounded-2xl flex items-center justify-center transition shadow-md transform active:scale-95 flex-shrink-0 ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-4 ring-rose-200'
                : 'bg-forest-700 hover:bg-forest-800 text-white'
            } disabled:opacity-50`}
            title={isRecording ? 'Click to stop recording' : 'Click to speak your doubt'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-amber-300" />}
          </button>

          {/* Text Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskDoubt(inputText);
            }}
            className="flex-1 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isProcessing || isRecording}
              placeholder={
                isHindi
                  ? 'माइक दबाकर बोलें या यहाँ अपना सवाल लिखें...'
                  : 'Press mic to speak or type your doubt here...'
              }
              className="flex-1 bg-stone-50 border border-stone-300 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-forest-700 focus:bg-white transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing || isRecording}
              className="p-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white transition disabled:opacity-40 flex items-center justify-center flex-shrink-0"
              title="Send Doubt"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
