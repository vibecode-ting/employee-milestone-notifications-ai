// AiCopilotChat.tsx — Omniscient High-Intel AI Chat Copilot (Screen 6)
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface Message {
  role: 'user' | 'model';
  content: string;
  toolsUsed?: string[];
  cardDataUrl?: string;
  previewUrl?: string;
  timestamp: Date;
}

interface Props {
  isDrawer: boolean;
}

const QUICK_PROMPTS: Record<string, string[]> = {
  en: [
    '🎂 Who has a birthday or work anniversary in the next 30 days?',
    '📊 Summarize employees by department and average tenure.',
    '⚙️ Is auto-email turned on? Which employees have it disabled?',
    '🎁 Suggest 3 personalized birthday gifts under $50 for the next celebrant.',
    '🎨 Generate and preview a celebration card for the next birthday.',
  ],
  my: [
    '🎂 လာမည့် ရက် ၃၀ အတွင်း မည်သူမည်ဝါတို့ မွေးနေ့ (သို့) နှစ်ပတ်လည်ရှိသနည်း?',
    '📊 ဌာနအလိုက် ဝန်ထမ်းအရေအတွက်နှင့် ပျမ်းမျှလုပ်သက် ပြပါ။',
    '⚙️ Auto-email ဖွင့်ထားသလား? မည်သူတို့ ပိတ်ထားသနည်း?',
    '🎁 နောက်ဆုံး မွေးနေ့ဆင်နွှဲမည့် ဝန်ထမ်းအတွက် $50 ဘတ်ဂျက်နှင့် လက်ဆောင်ကိုးမျိုး အကြံပြုပေးပါ။',
    '🎨 မွေးနေ့ ကတ်တစ်ခု ဖန်တီးပြပါ။',
  ],
  zh: [
    '🎂 未来30天内有谁过生日或工作周年纪念日?',
    '📊 按部门统计员工数量和平均工龄。',
    '⚙️ 自动发送邮件是否开启?哪些员工关闭了?',
    '🎁 为下一位过生日的员工推荐3件50美元以内的个性化礼物。',
    '🎨 生成并预览一张生日庆典贺卡。',
  ],
  vi: [
    '🎂 Ai có sinh nhật hoặc kỷ niệm làm việc trong 30 ngày tới?',
    '📊 Tóm tắt nhân viên theo phòng ban và thâm niên trung bình.',
    '⚙️ Email tự động có đang bật không? Nhân viên nào đã tắt?',
    '🎁 Gợi ý 3 món quà sinh nhật cá nhân hóa dưới $50 cho người tiếp theo.',
    '🎨 Tạo và xem trước thiệp chúc mừng sinh nhật.',
  ],
  hi: [
    '🎂 अगले 30 दिनों में किसका जन्मदिन या कार्य वर्षगांठ है?',
    '📊 विभाग के अनुसार कर्मचारियों की संख्या और औसत कार्यकाल बताएं।',
    '⚙️ क्या ऑटो-ईमेल चालू है? किन कर्मचारियों ने इसे बंद किया है?',
    '🎁 अगले जन्मदिन वाले के लिए $50 में 3 व्यक्तिगत उपहार सुझाएं।',
    '🎨 एक उत्सव कार्ड बनाएं और पूर्वावलोकन करें।',
  ],
};

export default function AiCopilotChat({ isDrawer }: Props) {
  const { locale, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: `🤖 **Hello! I\'m CultureOS AI Copilot** — your elite HR intelligence assistant.\n\nI have direct access to all employee data, app settings, notification logs, and can trigger real actions (send emails, generate cards, update records) via Gemini Function Calling.\n\nWhat would you like to know?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Build history (exclude first system message)
    const history = messages.filter(m => m !== messages[0]).map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          preferredLanguage: locale,
        }),
      });
      const data = await res.json();
      const modelMsg: Message = {
        role: 'model',
        content: data.response || data.error || 'I encountered an error. Please try again.',
        toolsUsed: data.toolsUsed,
        cardDataUrl: data.cardDataUrl,
        previewUrl: data.previewUrl,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'model',
        content: '❌ Connection error. Please check that the backend is running.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const prompts = QUICK_PROMPTS[locale] || QUICK_PROMPTS.en;

  // Simple markdown renderer (bold, newlines)
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
          )}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <div className={`flex flex-col h-full ${
      isDrawer ? '' : 'bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden'
    }`}>
      {/* Quick prompt chips */}
      {messages.length <= 1 && (
        <div className="px-4 pt-4 pb-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Quick Prompts:</div>
          <div className="flex flex-col gap-1.5">
            {prompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                className="text-left text-xs bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-xl transition-colors script-safe leading-relaxed"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          }`}>
            <div className={`max-w-[85%] ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl rounded-tl-sm px-4 py-2.5'
            }`}>
              {/* Tool execution badges */}
              {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {msg.toolsUsed.map((tool, j) => (
                    <span key={j} className="inline-flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                      ⚡ {tool.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Message content */}
              <div className="text-sm leading-relaxed script-safe whitespace-pre-wrap">
                {renderMarkdown(msg.content)}
              </div>

              {/* Inline card preview */}
              {msg.cardDataUrl && (
                <div className="mt-3">
                  <img src={msg.cardDataUrl} alt="Celebration Card" className="w-full rounded-xl shadow-lg" />
                  {msg.previewUrl && (
                    <a href={msg.previewUrl} target="_blank" rel="noopener noreferrer"
                      className="block text-center text-xs text-indigo-600 dark:text-indigo-400 underline mt-2"
                    >View Email Preview →</a>
                  )}
                </div>
              )}

              <div className={`text-xs mt-1 opacity-50 ${
                msg.role === 'user' ? 'text-right text-white' : 'text-slate-500'
              }`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-xs text-slate-500">🤖 Thinking + querying database...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('copilotPlaceholder')}
            rows={2}
            disabled={loading}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-gray-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none script-safe disabled:opacity-60"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white p-2.5 rounded-xl transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center">
          Press Enter to send • Shift+Enter for new line • Powered by Gemini 2.5 Flash Function Calling
        </div>
      </div>
    </div>
  );
}
