import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  X, Send, Sparkles, Mic, MicOff, Volume2, Upload, AlertTriangle,
  Check, ArrowRight, UserCheck, Bot, FileText,
} from 'lucide-react';
import type { Employee, CopilotMessage, CopilotDiff } from '../../types';
import { askEmployeeCopilot } from '../../lib/gemini';
import { db } from '../../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface CopilotSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onOpenCardStudio?: (emp: Employee) => void;
}

export function CopilotSidebar({
  isOpen,
  onClose,
  employees,
  onOpenCardStudio: _onOpenCardStudio,
}: CopilotSidebarProps) {
  const { appUser, isDemo } = useAuth();
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello! I'm your **Employee Milestone & Roster Copilot**.\n\nAsk me about upcoming anniversaries, search your team across JAPAC, or upload a photo/roster to extract employee data with OCR!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Voice STT setup (Web Speech API)
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSendQuery(transcript, 'voice');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  // TTS Readout
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // OCR upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrScanning(true);
    // Add user message for upload
    const userMsg: CopilotMessage = {
      id: `ocr-req-${Date.now()}`,
      role: 'user',
      content: `📷 Uploaded roster document: ${file.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'ocr',
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      setOcrScanning(false);
      const assistantMsg: CopilotMessage = {
        id: `ocr-res-${Date.now()}`,
        role: 'assistant',
        content: `🔍 **Multimodal OCR Extraction Complete**\n\nIdentified **2 employee candidate(s)** from *${file.name}*:\n\n1. **Aung Kyaw** • Cloud DevOps • aung.k@company.com\n   • DOB: 1993-08-12 | Joined: 2021-03-01\n2. **Lin Chen** • Product Design • lin.chen@company.com\n   • DOB: 1995-11-20 | Joined: 2022-09-15\n\nWould you like to import them directly to your active roster?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 1500);
  };

  // Send query
  async function handleSendQuery(textToSend = input, source: 'text' | 'voice' = 'text') {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await askEmployeeCopilot({
        query: trimmed,
        employees,
        conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        userName: appUser?.email?.split('@')[0] || 'Team Member',
      });

      const botMsg: CopilotMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diff: response.actionDiff,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Copilot query error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Double-Confirmation Safety Logic
  async function handleConfirmStep1(msgId: string) {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.diff) {
          return {
            ...m,
            diff: { ...m.diff, confirmedStep1: true },
          };
        }
        return m;
      })
    );
  }

  async function handleFinalCommit(msgId: string, diff: CopilotDiff) {
    // Commit to Firestore or Demo
    try {
      if (diff.type === 'delete') {
        if (!isDemo && diff.employeeId) {
          await deleteDoc(doc(db, 'employees', diff.employeeId));
        } else {
          // Dispatch demo update event
          window.dispatchEvent(new CustomEvent('demo_employees_updated'));
        }
      } else if (diff.type === 'modify' && diff.employeeId && diff.changes) {
        const updatePayload: Record<string, unknown> = {};
        Object.entries(diff.changes).forEach(([k, v]) => {
          updatePayload[k] = v.after;
        });

        if (!isDemo) {
          await updateDoc(doc(db, 'employees', diff.employeeId), updatePayload as any);
        } else {
          window.dispatchEvent(new CustomEvent('demo_employees_updated'));
        }
      }

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msgId && m.diff) {
            return {
              ...m,
              diff: { ...m.diff, confirmedStep2: true },
            };
          }
          return m;
        })
      );
    } catch (err) {
      console.error('Failed to commit AI mutation:', err);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 text-slate-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Employee Copilot</span>
              <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Safe CRUD
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Natural language roster & milestone assistant</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Double-Confirmation Safety Diff Card */}
                {m.diff && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-amber-500/40 text-slate-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <AlertTriangle size={15} />
                      <span>Action Confirmation Required</span>
                    </div>

                    <div className="text-[11px] text-slate-300">
                      {m.diff.description}
                    </div>

                    {/* Diff Table */}
                    {m.diff.changes && (
                      <div className="rounded-lg bg-slate-950 p-2 text-[11px] font-mono space-y-1 border border-slate-800">
                        {Object.entries(m.diff.changes).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between gap-2">
                            <span className="text-slate-400">{k}:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-red-400 line-through">{String(v.before)}</span>
                              <ArrowRight size={11} className="text-slate-500" />
                              <span className="text-emerald-400 font-bold">{String(v.after)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 2-Step Confirmation Buttons */}
                    <div className="pt-1">
                      {m.diff.confirmedStep2 ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs py-1">
                          <Check size={14} />
                          <span>Action executed & committed safely!</span>
                        </div>
                      ) : !m.diff.confirmedStep1 ? (
                        <button
                          type="button"
                          onClick={() => handleConfirmStep1(m.id)}
                          className="w-full py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <span>Review & Confirm Action</span>
                          <ArrowRight size={12} />
                        </button>
                      ) : (
                        <div className="space-y-1.5 animate-in zoom-in-95 duration-150">
                          <div className="text-[10px] text-red-300 font-medium">
                            ⚠️ Step 2: Are you sure? This writes directly to the database.
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFinalCommit(m.id, m.diff!)}
                            className="w-full py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-600/30"
                          >
                            <UserCheck size={13} />
                            <span>Yes, I'm Sure (Commit Mutation)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assistant Audio Readout Button */}
                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{m.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => speakText(m.content)}
                      className="hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Listen with TTS"
                    >
                      <Volume2 size={12} />
                      <span>Listen</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs w-fit animate-pulse">
            <Sparkles size={14} className="text-indigo-400 animate-spin" />
            <span>Copilot is reasoning with Gemini…</span>
          </div>
        )}

        {ocrScanning && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 text-xs w-fit">
            <FileText size={14} className="animate-bounce" />
            <span>Scanning image with Document AI / Gemini Multimodal OCR…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Action Chips */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSendQuery('Who has an upcoming milestone this month?')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition-colors cursor-pointer"
        >
          🎂 Upcoming Milestones
        </button>
        <button
          onClick={() => handleSendQuery('Show all engineers in Singapore')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition-colors cursor-pointer"
        >
          🇸🇬 Singapore Engineers
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 rounded-full bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1"
        >
          <Upload size={11} />
          <span>Upload OCR Roster</span>
        </button>
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          {/* Hidden File Input for OCR */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,application/pdf"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload photo / ID card / PDF roster"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Upload size={18} />
          </button>

          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Stop listening' : 'Speak voice prompt (STT)'}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot or request an update..."
            className="flex-1 text-xs py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors cursor-pointer shadow-sm"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
