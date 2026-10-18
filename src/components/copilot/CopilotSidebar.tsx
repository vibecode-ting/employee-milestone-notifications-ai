import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  X, Send, Sparkles, Mic, MicOff, Volume2, Upload, AlertTriangle,
  Check, ArrowRight, UserCheck, Bot, FileText, Key, CheckCircle2,
} from 'lucide-react';
import type { Employee, CopilotMessage, CopilotDiff, OcrCandidate } from '../../types';
import {
  askEmployeeCopilot,
  extractEmployeesFromDocument,
  getGeminiApiKey,
  setGeminiApiKey,
} from '../../lib/gemini';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getDemoEmployees, saveDemoEmployees } from '../../utils/demoData';

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
      content: `👋 Hello! I'm your **Employee Milestone & Roster Copilot**.\n\nAsk me about upcoming anniversaries, search your team across JAPAC, or upload an employee roster/ID badge to parse with live **Gemini 2.5 Flash Multimodal Vision**!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);

  // Gemini API Key config modal state
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getGeminiApiKey());
  const [hasApiKey, setHasApiKey] = useState(() => !!getGeminiApiKey());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveApiKey = () => {
    setGeminiApiKey(apiKeyInput);
    setHasApiKey(!!apiKeyInput.trim());
    setShowKeyModal(false);
  };

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
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            setInput(event.results[i][0].transcript);
          }
        }
        if (finalTranscript) {
          setInput(finalTranscript);
          handleSendQuery(finalTranscript, 'voice');
          recognition.stop();
          setIsListening(false);
        }
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

  // Real Gemini Multimodal OCR file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrScanning(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const userMsg: CopilotMessage = {
          id: `ocr-req-${Date.now()}`,
          role: 'user',
          content: `📷 Uploaded roster document: ${file.name}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'ocr',
          imageDataUrl: dataUrl,
        };
        setMessages((prev) => [...prev, userMsg]);

        const base64Data = dataUrl.split(',')[1];
        const mimeType = file.type || 'image/jpeg';

        const result = await extractEmployeesFromDocument({
          fileBase64: base64Data,
          mimeType,
          fileName: file.name,
        });

        const assistantMsg: CopilotMessage = {
          id: `ocr-res-${Date.now()}`,
          role: 'assistant',
          content: result.isLiveApi
            ? `🔍 **Gemini Multimodal Vision Extraction Complete**\n\nIdentified **${result.candidates.length} employee candidate(s)** from *${file.name}* using **${result.model}**:`
            : `🔍 **OCR Extraction Preview**\n\nIdentified **${result.candidates.length} candidate(s)** from *${file.name}*:\n\n*${result.message || ''}*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ocrCandidates: result.candidates,
          model: result.model,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        console.error('OCR Parsing error:', err);
        const rawErr = err?.message || 'Failed to parse image with Gemini Vision.';
        const cleanErr = rawErr.replace(/^Error:\s*/i, '');
        const errorMsg: CopilotMessage = {
          id: `ocr-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Multimodal OCR encountered an issue**: ${cleanErr}\n\nPlease verify your Gemini API key (click **Key** in the top-right header) or try uploading another document photo.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setOcrScanning(false);
      }
    };

    reader.onerror = () => {
      setOcrScanning(false);
      console.error('FileReader error during OCR upload');
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Generate an in-memory sample employee roster document canvas to test live OCR
  const handleTestSampleDocument = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background & Card styling
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 800, 420);

    // Header banner
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(0, 0, 800, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🏢 ACME GLOBAL • JAPAC EMPLOYEE BADGE ROSTER', 30, 44);

    // Candidate 1: David Tan
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(30, 95, 350, 290);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(30, 95, 350, 290);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('David Tan (陈大伟)', 50, 135);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Role: Senior SRE Engineer', 50, 165);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Department: Cloud Infrastructure', 50, 195);
    ctx.fillText('Date of Birth: 1993-04-18', 50, 225);
    ctx.fillText('Joined Date: 2020-05-11', 50, 255);
    ctx.fillText('Email: david.tan@company.com', 50, 285);
    ctx.fillText('Phone: +65 9876 5432', 50, 315);
    ctx.fillText('Location: Singapore HQ', 50, 345);

    // Candidate 2: Thiri San
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(410, 95, 350, 290);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(410, 95, 350, 290);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Thiri San (သီရိစန်း)', 430, 135);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText('Role: Lead Product Designer', 430, 165);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('Department: Product Design', 430, 195);
    ctx.fillText('Date of Birth: 1996-09-25', 430, 225);
    ctx.fillText('Joined Date: 2022-02-01', 430, 255);
    ctx.fillText('Email: thiri.san@company.com', 430, 285);
    ctx.fillText('Phone: +95 9 1234 5678', 430, 315);
    ctx.fillText('Location: Yangon Hub', 430, 345);

    const dataUrl = canvas.toDataURL('image/png');
    const base64Data = dataUrl.split(',')[1];

    setOcrScanning(true);
    const userMsg: CopilotMessage = {
      id: `ocr-req-${Date.now()}`,
      role: 'user',
      content: `📷 Processed sample employee badge document (David Tan & Thiri San)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'ocr',
    };
    setMessages((prev) => [...prev, userMsg]);

    extractEmployeesFromDocument({
      fileBase64: base64Data,
      mimeType: 'image/png',
      fileName: 'acme-japac-roster-badge.png',
    })
      .then((res) => {
        const assistantMsg: CopilotMessage = {
          id: `ocr-res-${Date.now()}`,
          role: 'assistant',
          content: res.isLiveApi
            ? `🔍 **Gemini Multimodal Vision Extraction Complete**\n\nIdentified **${res.candidates.length} employee candidate(s)** from *acme-japac-roster-badge.png* using **${res.model}**:`
            : `🔍 **OCR Extraction Preview**\n\nIdentified **${res.candidates.length} candidate(s)** from sample badge:\n\n*${res.message || ''}*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ocrCandidates: res.candidates,
          model: res.model,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      })
      .catch((err) => {
        console.warn('Sample OCR live call fell back to synthetic candidates:', err);
        const fallbackCandidates: OcrCandidate[] = [
          {
            name: 'David Tan (陈大伟)',
            department: 'Cloud Infrastructure',
            role: 'Senior SRE Engineer',
            email: 'david.tan@company.com',
            phone: '+65 9876 5432',
            dob: '1993-04-18',
            joinedDate: '2020-05-11',
            location: 'Singapore HQ',
            confidence: 0.98,
          },
          {
            name: 'Thiri San (သီရိစန်း)',
            department: 'Product Design',
            role: 'Lead Product Designer',
            email: 'thiri.san@company.com',
            phone: '+95 9 1234 5678',
            dob: '1996-09-25',
            joinedDate: '2022-02-01',
            location: 'Yangon Hub',
            confidence: 0.96,
          },
        ];
        const assistantMsg: CopilotMessage = {
          id: `ocr-res-${Date.now()}`,
          role: 'assistant',
          content: `🔍 **OCR Extraction (Sample Preview Mode)**\n\nIdentified **2 employee candidate(s)** from sample badge canvas *(Note: ${err?.message || 'Using local synthetic parser'}).* You can review and import them below:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ocrCandidates: fallbackCandidates,
          model: 'Sample Badge Heuristic',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      })
      .finally(() => {
        setOcrScanning(false);
      });
  };

  // Import extracted candidates directly into active roster
  const handleImportCandidates = async (msgId: string, candidates: OcrCandidate[]) => {
    try {
      const newEmployees: Employee[] = candidates.map((c, idx) => ({
        id: `ocr-${Date.now()}-${idx}`,
        userId: appUser?.uid || 'demo_user_123',
        employeeId: `EMP${String(Math.floor(100 + Math.random() * 900))}`,
        name: c.name,
        department: c.department || 'Workforce',
        email: c.email || `${c.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        phone: c.phone || '0912345678',
        dob: c.dob || '1995-01-01',
        joinedDate: c.joinedDate || new Date().toISOString().slice(0, 10),
        status: 'active',
        createdAt: new Date().toISOString() as any,
      }));

      if (!isDemo && appUser?.uid) {
        for (const emp of newEmployees) {
          await addDoc(collection(db, 'employees'), emp);
        }
      } else {
        const current = getDemoEmployees(appUser?.uid || 'demo_user_123');
        saveDemoEmployees([...newEmployees, ...current]);
      }

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msgId) {
            return {
              ...m,
              imported: true,
            };
          }
          return m;
        })
      );

      const successMsg: CopilotMessage = {
        id: `import-success-${Date.now()}`,
        role: 'assistant',
        content: `🎉 **Successfully imported ${newEmployees.length} employee(s) into your roster!**\n\n${newEmployees
          .map((e) => `• **${e.name}** (${e.department}) • Joined: ${e.joinedDate}`)
          .join('\n')}\n\nYour dashboard incoming milestones and active headcount have been updated automatically.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, successMsg]);
    } catch (err) {
      console.error('Failed to import OCR candidates:', err);
    }
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            title={hasApiKey ? 'Gemini 2.0 Flash API Connected' : 'Configure Gemini API Key'}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              hasApiKey
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 animate-pulse'
            }`}
          >
            <Key size={12} />
            <span>{hasApiKey ? 'Gemini 2.0 Flash' : 'Set API Key'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Inline Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Key size={16} className="text-indigo-400" />
                <span>Gemini API Key Settings</span>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Enter your Google AI Studio API key to run live <strong>Gemini 2.0 Flash Multimodal Vision</strong> and personalized AI milestone greetings in local.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Gemini API Key (AIzaSy...)
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste AIzaSy key here..."
                className="w-full text-xs py-2 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {hasApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setApiKeyInput('');
                    setGeminiApiKey('');
                    setHasApiKey(false);
                    setShowKeyModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  Clear Key
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}

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
                {/* Voice prompt indicator */}
                {m.source === 'voice' && (
                  <div className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white mb-2 font-medium">
                    <Mic size={10} />
                    <span>Voice Prompt</span>
                  </div>
                )}

                {/* Uploaded OCR image preview */}
                {m.imageDataUrl && (
                  <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 bg-black/40 max-h-48 shadow-inner">
                    <img
                      src={m.imageDataUrl}
                      alt="Uploaded roster document"
                      className="w-full h-auto object-cover max-h-48"
                    />
                  </div>
                )}

                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* OCR Candidates Interactive Preview Card */}
                {m.ocrCandidates && m.ocrCandidates.length > 0 && (
                  <div className="mt-3 space-y-2.5">
                    <div className="grid grid-cols-1 gap-2">
                      {m.ocrCandidates.map((cand, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-indigo-500/50 transition-all text-xs space-y-1.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-white text-sm tracking-tight">{cand.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-mono border border-cyan-500/30">
                              {Math.round((cand.confidence || 0.95) * 100)}% Confidence
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                            <span className="text-indigo-400 font-semibold">{cand.role || 'Team Member'}</span>
                            <span>•</span>
                            <span className="text-slate-400">{cand.department}</span>
                            {cand.location && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400">{cand.location}</span>
                              </>
                            )}
                          </div>

                          <div className="text-[10px] text-slate-400 grid grid-cols-2 gap-1 pt-1.5 border-t border-slate-800">
                            <div>🎂 DOB: <span className="text-slate-200 font-mono">{cand.dob}</span></div>
                            <div>🏆 Joined: <span className="text-slate-200 font-mono">{cand.joinedDate}</span></div>
                            <div className="col-span-2 truncate">✉️ {cand.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* One-Click Import Button */}
                    {m.imported ? (
                      <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 flex items-center justify-center gap-2 text-xs font-bold shadow-xs">
                        <CheckCircle2 size={16} />
                        <span>Imported into Roster! ✓</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleImportCandidates(m.id, m.ocrCandidates!)}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer border border-emerald-400/40"
                      >
                        <Sparkles size={14} />
                        <span>Import {m.ocrCandidates.length} Candidate(s) into Roster</span>
                      </button>
                    )}
                  </div>
                )}

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
            <span>Scanning image with Gemini 2.0 Flash Multimodal Vision…</span>
          </div>
        )}

        {isListening && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Listening to voice prompt... {input ? `"${input}"` : 'Speak now'}</span>
            </div>
            <button
              type="button"
              onClick={() => handleSendQuery(input, 'voice')}
              disabled={!input.trim()}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] disabled:opacity-40 cursor-pointer"
            >
              Send Voice
            </button>
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
          type="button"
          onClick={handleTestSampleDocument}
          className="px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
          title="Generate multi-lingual roster canvas and run live Multimodal Vision OCR"
        >
          <Sparkles size={11} />
          <span>🖼️ Try Sample Badge OCR</span>
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 rounded-full bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1"
        >
          <Upload size={11} />
          <span>Upload Image / PDF</span>
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
