import type { CardTone, CardTheme, GeneratedCard, Employee, CopilotDiff, OcrCandidate } from '../types';

export function getGeminiApiKey(): string {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof window !== 'undefined' ? localStorage.getItem('VITE_GEMINI_API_KEY') || localStorage.getItem('GEMINI_API_KEY') || '' : '')
  );
}

export function setGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  const clean = key.trim();
  if (clean) {
    localStorage.setItem('GEMINI_API_KEY', clean);
    localStorage.setItem('VITE_GEMINI_API_KEY', clean);
  } else {
    localStorage.removeItem('GEMINI_API_KEY');
    localStorage.removeItem('VITE_GEMINI_API_KEY');
  }
}

// ---------------------------------------------------------------------------
// DYNAMIC MODEL DISCOVERY & COMPATIBILITY LAYER
// ---------------------------------------------------------------------------

let cachedDiscoveredModels: string[] | null = null;
let cachedKeyForDiscovery: string = '';

export const PREFERRED_GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
];

export async function getAvailableGeminiModels(apiKey: string): Promise<string[]> {
  if (!apiKey) return PREFERRED_GEMINI_MODELS;
  if (cachedDiscoveredModels && cachedKeyForDiscovery === apiKey && cachedDiscoveredModels.length > 0) {
    return cachedDiscoveredModels;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.models)) {
        const supported = data.models
          .filter(
            (m: any) =>
              Array.isArray(m.supportedGenerationMethods) &&
              m.supportedGenerationMethods.includes('generateContent')
          )
          .map((m: any) => String(m.name || '').replace(/^models\//, ''))
          .filter((name: string) => Boolean(name));

        if (supported.length > 0) {
          const sorted = supported.sort((a: string, b: string) => {
            const indexA = PREFERRED_GEMINI_MODELS.findIndex((p) => a === p || a.startsWith(p));
            const indexB = PREFERRED_GEMINI_MODELS.findIndex((p) => b === p || b.startsWith(p));
            const scoreA = indexA >= 0 ? indexA : 999;
            const scoreB = indexB >= 0 ? indexB : 999;
            return scoreA - scoreB;
          });
          cachedDiscoveredModels = sorted;
          cachedKeyForDiscovery = apiKey;
          return sorted;
        }
      }
    }
  } catch (err) {
    console.warn('Dynamic Gemini model discovery encountered issue, using priority list:', err);
  }

  return PREFERRED_GEMINI_MODELS;
}

interface GenerateCardParams {
  employee: Employee;
  milestoneType: 'BIRTHDAY' | 'ANNIVERSARY';
  years?: number;
  tone: CardTone;
  theme?: CardTheme;
  customNotes?: string;
  achievements?: string;
  language?: string;
}

// ---------------------------------------------------------------------------
// 1. TONE-BASED PROMPT ENGINE & LOCAL FALLBACK TEMPLATES
// ---------------------------------------------------------------------------

const LOCAL_FALLBACKS: Record<CardTone, (e: Employee, type: string, years?: number, lang?: string, achievements?: string) => { headline: string; message: string; quote: string }> = {
  warm: (e, type, years, lang) => {
    if (lang === 'mm') {
      return {
        headline: type === 'BIRTHDAY' ? `ပျော်ရွှင်ဖွယ် မွေးနေ့ဖြစ်ပါစေ ${e.name}! 🎂` : `${years} နှစ်ပြည့် အလုပ်နှစ်ပတ်လည် ဂုဏ်ပြုပါသည်! 🌟`,
        message: type === 'BIRTHDAY'
          ? `အဖွဲ့သားအားလုံးမှ ${e.name} အား နွေးထွေးစွာ ဂုဏ်ပြုဆုမွန်ကောင်းတောင်းအပ်ပါသည်။ သင်၏ကြိုးစားအားထုတ်မှုနှင့် ဖော်ရွေမှုသည် ${e.department} အတွက် အဖိုးမဖြတ်နိုင်သော အင်အားဖြစ်ပါသည်။`
          : `${years} နှစ်တာ ကာလအတွင်း သင်၏ ခိုင်မာသော သစ္စာရှိမှုနှင့် စွမ်းဆောင်ရည်မြင့်မားမှုအတွက် အထူးပင် ကျေးဇူးတင်ရှိပါသည်။ သင်နှင့်အတူ ဆက်လက်လက်တွဲခွင့်ရသည့်အတွက် ဂုဏ်ယူမိပါသည်။`,
        quote: '“လူတိုင်း၏ တန်ဖိုးရှိသော ခြေလှမ်းတိုင်းသည် အဖွဲ့အစည်းတစ်ခုလုံး၏ အောင်မြင်မှုဖြစ်ပါသည်။”',
      };
    }
    if (lang === 'zh' || lang === 'zh-HK') {
      return {
        headline: type === 'BIRTHDAY' ? `祝 ${e.name} 生日快乐！🎂` : `热烈祝贺 ${e.name} 入职 ${years} 周年！🎉`,
        message: type === 'BIRTHDAY'
          ? `愿新的一岁带给你无尽的快乐与充实！感谢你在 ${e.department} 团队中始终如一的温暖付出与卓越贡献。`
          : `感谢你在过去 ${years} 年间与我们携手并肩！你的专业素养与热忱为团队创造了非凡价值，期待与你共创更多辉煌里程碑。`,
        quote: '“心怀热忱，并肩前行，每一个坚实的脚印都铸就非凡。”',
      };
    }
    if (lang === 'vn') {
      return {
        headline: type === 'BIRTHDAY' ? `Chúc Mừng Sinh Nhật ${e.name}! 🎂` : `Chúc Mừng Kỷ Niệm ${years} Năm Đồng Hành! 🎉`,
        message: type === 'BIRTHDAY'
          ? `Toàn thể đội ngũ xin gửi lời chúc ấm áp nhất tới bạn! Cảm ơn năng lượng tích cực và sự tận tâm của bạn tại ${e.department}.`
          : `Trân trọng cảm ơn ${years} năm gắn bó đầy cống hiến của bạn. Sự kiên định và tài năng của bạn là niềm tự hào lớn của tập thể!`,
        quote: '“Mỗi bước chân đồng hành đều làm nên sức mạnh vĩ đại.”',
      };
    }
    if (lang === 'ko') {
      return {
        headline: type === 'BIRTHDAY' ? `생일 축하합니다, ${e.name}님! 🎂` : `${e.name}님의 입사 ${years}주년을 진심으로 축하합니다! 🎉`,
        message: type === 'BIRTHDAY'
          ? `소중한 생일을 진심으로 축하드립니다! 언제나 ${e.department} 팀에 따뜻한 활력과 열정을 더해주셔서 깊이 감사드립니다.`
          : `지난 ${years}년 동안 변함없는 성실함과 전문성으로 ${e.department}의 성장을 함께 이끌어주셔서 감사합니다. 앞으로의 여정도 힘차게 응원합니다!`,
        quote: '“신뢰와 헌신으로 함께 빚어낸 시간은 우리의 가장 큰 자산입니다.”',
      };
    }
    if (lang === 'ja') {
      return {
        headline: type === 'BIRTHDAY' ? `${e.name}さん、お誕生日おめでとうございます！🎂` : `${e.name}さん、勤続${years}周年おめでとうございます！🎉`,
        message: type === 'BIRTHDAY'
          ? `素敵な一年となりますよう心よりお祈り申し上げます。${e.department}チームでの日頃の温かいご尽力と貢献に深く感謝申し上げます。`
          : `入社${years}周年の節目を心よりお祝い申し上げます。長きにわたる献身的なご活躍とリーダーシップに敬意を表します。`,
        quote: '「日々の確かな信頼と支え合いが、チームの未来を拓く。」',
      };
    }
    // Default English
    return {
      headline: type === 'BIRTHDAY' ? `Happy Birthday, ${e.name}! 🎂` : `Celebrating ${years} Years of Excellence! 🎉`,
      message: type === 'BIRTHDAY'
        ? `Wishing you a day filled with joy, laughter, and celebration! Thank you for bringing warmth, kindness, and relentless dedication to the ${e.department} family every single day.`
        : `Happy ${years}-year work anniversary! Your steadfast dedication, mentorship, and creative drive continue to inspire everyone across ${e.department}. We are truly lucky to have you on our team.`,
      quote: '“True culture is built by the people who show up with heart every single day.”',
    };
  },

  executive: (e, type, years, lang) => {
    if (lang === 'ko') {
      return {
        headline: type === 'BIRTHDAY' ? `임원 격려사: ${e.name}님의 생일을 축하하며` : `리더십 표창: ${e.name}님 입사 ${years}주년`,
        message: type === 'BIRTHDAY'
          ? `경영진을 대표하여 ${e.name}님의 생일을 축하드립니다. ${e.department} 부서에서 보여주신 탁월한 역량과 전략적 실행력은 우리 조직의 핵심 원동력입니다.`
          : `${years}년에 걸친 탁월한 기여와 헌신에 깊은 경의를 표합니다. 최고 수준의 실행력과 책임감으로 조직의 성과를 이끌어 주심에 감사드립니다.`,
        quote: '“탁월한 리더십과 지속적인 헌신은 기업 성공의 견고한 기틀입니다.”',
      };
    }
    if (lang === 'ja') {
      return {
        headline: type === 'BIRTHDAY' ? `エグゼクティブ祝辞: ${e.name}様のご誕生日に寄せて` : `役員表彰: 勤続${years}周年の功績を讃えて`,
        message: type === 'BIRTHDAY'
          ? `経営陣を代表し、${e.name}様のお誕生日に心より祝意を表します。${e.department}部門における卓越したリーダーシップと事業貢献に感謝申し上げます。`
          : `${years}年にわたる多大な貢献と真摯な職務遂行を高く評価いたします。貴殿の戦略的実行力は全社の模範であります。`,
        quote: '「持続的な挑戦と高い規律こそが、確固たる成長を創出する。」',
      };
    }
    if (lang === 'zh' || lang === 'zh-HK') {
      return {
        headline: type === 'BIRTHDAY' ? `管理层贺词：致 ${e.name} 华诞` : `卓越嘉奖：热烈庆贺 ${e.name} 履职 ${years} 周年`,
        message: type === 'BIRTHDAY'
          ? `代表管理层及 ${e.department} 部门向 ${e.name} 致以崇高敬意。您的专业素养与扎实作为持续驱动团队创新前行。`
          : `谨向 ${e.name} 达成 ${years} 年卓越任职致以热烈表彰。您坚定的使命担当与高效交付，树立了亚太区标杆。`,
        quote: '“笃行致远，唯实励新；持之以恒，方显卓越。”',
      };
    }
    if (lang === 'mm') {
      return {
        headline: type === 'BIRTHDAY' ? `စီမံခန့်ခွဲမှုအဖွဲ့မှ ${e.name} အား အထူးဂုဏ်ပြုဆုမွန်ကောင်း` : `ဦးဆောင်မှုအသိအမှတ်ပြုခြင်း: ${years} နှစ်ပြည့် သစ္စာရှိမှု`,
        message: `အဖွဲ့အစည်း၏ ရည်မှန်းချက်များကို စွမ်းဆောင်ရည်ပြည့်ဝစွာ အကောင်အထည်ဖော်ပေးနေသော ${e.name} ၏ စံပြကြိုးပမ်းအားထုတ်မှုအတွက် အလေးအနက် အသိအမှတ်ပြု ဂုဏ်ယူပါသည်။`,
        quote: '“ခိုင်မာသော ဦးဆောင်မှုနှင့် ကြိုးစားအားထုတ်မှုသည် အဖွဲ့အစည်း၏ အောင်မြင်မှုမဏ္ဍိုင်ဖြစ်ပါသည်။”',
      };
    }
    return {
      headline: type === 'BIRTHDAY' ? `Honoring ${e.name} on Their Special Day` : `Executive Commendation: ${years}-Year Milestone`,
      message: type === 'BIRTHDAY'
        ? `On behalf of leadership and the ${e.department} division, we extend our sincerest congratulations to ${e.name}. Your strategic contributions and consistent operational rigor drive continuous innovation across our organization.`
        : `Leadership proudly recognizes ${e.name} for achieving ${years} years of impactful service. Your dedication to mission objectives and high-performing delivery sets a benchmark for organizational excellence across Asia Pacific.`,
      quote: '“Leadership and sustained commitment are the foundational pillars of enterprise achievement.”',
    };
  },

  fun: (e, type, years, lang) => {
    if (lang === 'ko') {
      return {
        headline: type === 'BIRTHDAY' ? `레벨 업! 오늘은 ${e.name}님의 생일! 🚀` : `대박! ${e.name}님과 함께한 환상의 ${years}년! ⚡`,
        message: type === 'BIRTHDAY'
          ? `회의는 잠시 멈추고 축하 케이크를 꺼내세요! 🍰 오늘 하루 최고의 기쁨과 행운이 함께하길 바라며, 칼퇴와 맛있는 간식 가득한 날 되세요!`
          : `와우! ${years}년 동안 ${e.department}에서 멋진 아이디어와 든든한 팀플레이로 팀을 빛내주셔서 최고입니다! 앞으로도 파이팅!`,
        quote: '“열심히 일하고, 더 신나게 축하하자! 케이크는 필수!”',
      };
    }
    if (lang === 'ja') {
      return {
        headline: type === 'BIRTHDAY' ? `レベルアップ！${e.name}さんのお誕生日です！🚀` : `祝！${e.name}さんと駆け抜けた最高な${years}年！⚡`,
        message: type === 'BIRTHDAY'
          ? `ミーティングは一旦休憩、ケーキでお祝いしましょう！🍰 ${e.name}さんの今日が最高のハッピーで満たされますように！`
          : `大歓声！${years}年間にわたり${e.department}で最高のアイデアとチームプレーをありがとう！これからも一緒に盛り上がりましょう！`,
        quote: '「よく働き、もっと楽しくお祝いしよう！お祝いケーキは別腹！」',
      };
    }
    if (lang === 'zh' || lang === 'zh-HK') {
      return {
        headline: type === 'BIRTHDAY' ? `升级通关！祝 ${e.name} 生日快乐！🚀` : `超能战力！与 ${e.name} 并肩作战的 ${years} 年！⚡`,
        message: type === 'BIRTHDAY'
          ? `暂停会议，切蛋糕时间到！🍰 向 ${e.name} 送上最热烈的击掌与欢呼！愿新的一岁代码零报错、咖啡超对味！`
          : `哇塞！在 ${e.department} 与你一起征战的 ${years} 年简直太精彩！感谢你带来的欢声笑语与满满能量！`,
        quote: '“认真搞事业，放肆庆里程碑！周年派对绝对不能少！”',
      };
    }
    return {
      headline: type === 'BIRTHDAY' ? `Level Up! It's ${e.name}'s Birthday! 🚀` : `Boom! ${years} Epic Years with ${e.name}! ⚡`,
      message: type === 'BIRTHDAY'
        ? `Hold the meetings, pause the Slack pings, and bring out the cake! 🍰 Sending massive high-fives to ${e.name} today. May your code deploy smoothly and your coffee stay strong!`
        : `Whoop whoop! ${years} years of awesome ideas, emergency debugging, and heroic team saves in ${e.department}! Thanks for keeping our spirits high and goals crushed!`,
      quote: '“Work hard, celebrate harder, and never skip the anniversary cake!”',
    };
  },

  cultural: (e, type, years, lang) => {
    if (lang === 'mm') {
      return {
        headline: type === 'BIRTHDAY' ? `မင်္ဂလာရှိသော မွေးနေ့ဆုတောင်း ${e.name} 🙏` : `မင်္ဂလာအပေါင်းနှင့်ပြည့်စုံသော ${years} နှစ်မြောက် နှစ်ပတ်လည် 🌸`,
        message: `မြန်မာ့ရိုးရာ မင်္ဂလာတရားတော်များနှင့်အညီ ကျန်းမာချမ်းသာပြီး မင်္ဂလာအပေါင်းခညောင်းပါစေကြောင်း ${e.department} မိသားစုမှ မေတ္တာပို့သ ဂုဏ်ပြုအပ်ပါသည်။`,
        quote: '“စိတ်ချမ်းသာ ကိုယ်ကျန်းမာစွာဖြင့် အောင်မြင်မှုသရဖူ ဆွတ်ခူးနိုင်ပါစေ။”',
      };
    }
    if (lang === 'ko') {
      return {
        headline: type === 'BIRTHDAY' ? `기쁨과 번영을 기원하며: ${e.name}님의 생일 축하 🌸` : `${years}년의 소중한 인연과 헌신에 감사드립니다 🌸`,
        message: `상호 존중과 신뢰라는 우리 고유의 미덕을 바탕으로, ${e.department} 온 가족의 마음을 모아 ${e.name}님의 뜻깊은 날에 깊은 감사와 번영을 기원합니다.`,
        quote: '“배려와 성실함이 빚어낸 결실은 모두에게 귀감이 됩니다.”',
      };
    }
    if (lang === 'ja') {
      return {
        headline: type === 'BIRTHDAY' ? `${e.name}様のご健勝と多幸を祈念して 🌸` : `勤続${years}年の誠実なる歩みに深く敬意を表して 🌸`,
        message: `和敬清寂の心と長年の信頼を尊び、${e.department}一同より心からの感謝と今後の益々のご健勝を祈念申し上げます。`,
        quote: '「誠心誠意の歩みは、時を超えて豊かな実を結ぶ。」',
      };
    }
    if (lang === 'zh' || lang === 'zh-HK') {
      return {
        headline: type === 'BIRTHDAY' ? `岁序常易，华章日新：祝 ${e.name} 生辰吉乐 🌸` : `同舟共济，韶华与共：贺 ${e.name} 入职 ${years} 载 🌸`,
        message: `秉承尊贤崇礼、仁厚笃行之文化传统，${e.department} 全体同仁以赤诚之心向您致以最崇高的敬意与吉祥祝愿。`,
        quote: '“积力之所举，则无不胜也；众智之所为，则无不成也。”',
      };
    }
    if (lang === 'vn') {
      return {
        headline: type === 'BIRTHDAY' ? `Trân trọng kính chúc sinh nhật an lành ${e.name} 🌸` : `Tôn vinh ${years} năm gắn kết son sắt cùng ${e.name} 🌸`,
        message: `Đậm đà nét văn hóa trọng tình trọng nghĩa, tập thể ${e.department} kính chúc bạn sức khỏe dồi dào, vạn sự hanh thông và mãi là chỗ dựa vững vàng.`,
        quote: '“Đồng tâm hiệp lực, tương lai rạng ngời.”',
      };
    }
    return {
      headline: type === 'BIRTHDAY' ? `Warm Regional Wishes for ${e.name} 🌏` : `Honoring ${years} Years Across JAPAC 🌏`,
      message: `In celebration of our rich cross-cultural heritage across the Asia-Pacific community, we celebrate ${e.name}'s special milestone with gratitude, unity, and shared cultural pride.`,
      quote: '“Diverse perspectives unite to create harmonious achievements.”',
    };
  },

  professional: (e, type, years, _lang, achievements) => ({
    headline: type === 'BIRTHDAY' ? `Honoring ${e.name} on Their Special Day` : `Executive Commendation: ${years}-Year Milestone`,
    message: type === 'BIRTHDAY'
      ? `On behalf of leadership and the ${e.department} division, we extend our sincerest congratulations to ${e.name}. Your strategic contributions${achievements ? ` including ${achievements}` : ''} drive continuous innovation across our organization.`
      : `Leadership proudly recognizes ${e.name} for achieving ${years} years of impactful service${achievements ? `, highlighted by ${achievements}` : ''}. Your dedication sets a benchmark for organizational excellence across Asia Pacific.`,
    quote: '“Leadership and sustained commitment are the foundational pillars of enterprise achievement.”',
  }),

  celebratory: (e, type, years, _lang, achievements) => ({
    headline: type === 'BIRTHDAY' ? `Happy Birthday, ${e.name}! 🎉` : `Cheers to ${years} Incredible Years with ${e.name}! 🌟`,
    message: type === 'BIRTHDAY'
      ? `Wishing you a day filled with joy, laughter, and high energy! Thank you for bringing warmth, kindness, and incredible dedication${achievements ? ` (such as ${achievements})` : ''} to ${e.department} every single day!`
      : `Happy ${years}-year work anniversary! Your steadfast dedication, mentorship, and creative drive${achievements ? ` including ${achievements}` : ''} continue to inspire everyone across ${e.department}. We are truly lucky to have you on our team!`,
    quote: '“True culture is built by the people who show up with heart every single day.”',
  }),

  visionary: (e, type, years, _lang, achievements) => ({
    headline: type === 'BIRTHDAY' ? `Pioneering the Future: Happy Birthday, ${e.name}! 🚀` : `Shaping Tomorrow: ${years} Years of Vision with ${e.name}! 🌌`,
    message: type === 'BIRTHDAY'
      ? `To a visionary thinker and relentless innovator in ${e.department}: may your upcoming year unlock unprecedented breakthroughs${achievements ? `, building upon ${achievements}` : ''} and bold achievements!`
      : `Celebrating ${years} years of transformative impact! Your visionary perspective${achievements ? `, demonstrated in ${achievements}` : ''}, challenges conventions and steers our JAPAC team toward extraordinary future milestones.`,
    quote: '“The best way to predict the future is to create it together.”',
  }),
};

// ---------------------------------------------------------------------------
// 2. GEMINI AI CARD GENERATOR
// ---------------------------------------------------------------------------

export async function generatePersonalizedCard({
  employee,
  milestoneType,
  years = 1,
  tone,
  theme = 'sapphire',
  customNotes = '',
  achievements = '',
  language = 'en',
}: GenerateCardParams): Promise<GeneratedCard> {
  const fallback = LOCAL_FALLBACKS[tone](employee, milestoneType, years, language, achievements);
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    // Return high quality offline fallback
    let msg = fallback.message;
    if (achievements && !msg.includes(achievements)) {
      msg += ` Recent Highlights: ${achievements}.`;
    }
    if (customNotes) {
      msg += `\n\nP.S. ${customNotes}`;
    }
    return {
      id: `gen-card-${Date.now()}`,
      employeeName: employee.name,
      milestoneType,
      years,
      tone,
      theme,
      headline: fallback.headline,
      message: msg,
      quote: fallback.quote,
    };
  }

  try {
    const prompt = `
You are an expert enterprise HR Generative AI specializing in milestone recognition cards.
Generate a personalized celebration card with the following details:
- Employee Name: ${employee.name}
- Department: ${employee.department}
- Milestone: ${milestoneType === 'BIRTHDAY' ? 'Birthday' : `${years}-Year Work Anniversary`}
- Desired Tone: ${tone} (warm, executive, fun, professional, celebratory, visionary, or cultural)
- Language Locale: ${language}
- Recent Achievements: ${achievements || 'None specified'}
- Additional Context / Custom Notes: ${customNotes || 'None'}

Return ONLY a valid JSON object matching this schema (no markdown, no backticks):
{
  "headline": "concise headline string",
  "message": "2-3 sentences of heartwarming, personalized milestone text reflecting tone and achievements",
  "quote": "short inspirational one-liner quote"
}
`;

    const models = await getAvailableGeminiModels(apiKey);
    const candidateModels = models.slice(0, 3);

    for (const activeModel of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 350,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          return {
            id: `gen-card-${Date.now()}`,
            employeeName: employee.name,
            milestoneType,
            years,
            tone,
            theme,
            headline: parsed.headline || fallback.headline,
            message: parsed.message || fallback.message,
            quote: parsed.quote || fallback.quote,
          };
        }
      } catch (e) {
        console.warn(`Card generation attempt with ${activeModel} failed, trying next model...`);
      }
    }
  } catch (err) {
    console.warn('Gemini live call failed, using tone-aware local fallback:', err);
  }

  return {
    id: `gen-card-${Date.now()}`,
    employeeName: employee.name,
    milestoneType,
    years,
    tone,
    theme,
    headline: fallback.headline,
    message: customNotes ? `${fallback.message}\n\nP.S. ${customNotes}` : fallback.message,
    quote: fallback.quote,
  };
}

// ---------------------------------------------------------------------------
// 3. NON-ADMIN AI COPILOT WITH SAFE DOUBLE-CONFIRMATION MUTATIONS
// ---------------------------------------------------------------------------

export interface CopilotQueryParams {
  query: string;
  employees: Employee[];
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  userName?: string;
  language?: string;
}

export interface CopilotResponse {
  reply: string;
  actionDiff?: CopilotDiff;
  matchedEmployees?: Employee[];
}

export async function askEmployeeCopilot({
  query,
  employees,
  userName = 'Team Member',
  language = 'en',
}: CopilotQueryParams): Promise<CopilotResponse> {
  const normalized = query.toLowerCase().trim();

  // 1. Detect Delete Intent (e.g. "delete John Doe", "remove Sarah from roster")
  const deleteMatch = normalized.match(/(?:delete|remove|terminate)\s+([a-zA-Z\s]+)/i);
  if (deleteMatch) {
    const targetName = deleteMatch[1].trim();
    const emp = employees.find((e) => e.name.toLowerCase().includes(targetName.toLowerCase()));

    if (emp) {
      const deleteReplies: Record<string, string> = {
        mm: `⚠️ **${emp.name}** အား ဝန်ထမ်းစာရင်းမှ ပယ်ဖျက်ရန် တောင်းဆိုချက်ကို တွေ့ရှိရပါသည်။ ဝန်ထမ်းအချက်အလက် ပြင်ဆင်ခြင်းသည် မင်္ဂလာအသိပေးချက်များကို သက်ရောက်မှုရှိသဖြင့် လုံခြုံရေး အတည်ပြုချက် diff ပြင်ဆင်ထားပါသည်-`,
        zh: `⚠️ 我注意到您请求从员工名册中移除 **${emp.name}**。此操作将影响里程碑通知发送，已为您准备安全确认 diff：`,
        'zh-HK': `⚠️ 我注意到您請求從員工名冊中移除 **${emp.name}**。此操作將影響里程碑通知發送，已為您準備安全確認 diff：`,
        ja: `⚠️ 従業員名簿から **${emp.name}** さんの削除リクエストを検出しました。変更は通知配信に影響するため、2段階の安全確認 diff を用意しました：`,
        ko: `⚠️ 임직원 명부에서 **${emp.name}** 님을 삭제하도록 요청하셨습니다. 알림 발송에 직접적인 영향을 주므로 안전 2단계 확인 diff를 준비했습니다:`,
        vn: `⚠️ Tôi nhận thấy bạn muốn xóa **${emp.name}** khỏi danh sách nhân viên. Thao tác này ảnh hưởng đến việc gửi thông báo, vui lòng kiểm tra diff an toàn bên dưới:`,
      };

      return {
        reply: deleteReplies[language] || `⚠️ I noticed you requested to remove **${emp.name}** from the employee roster. Because modifying employee records impacts notification dispatches, I've prepared a safety confirmation diff for you:`,
        actionDiff: {
          id: `diff-${Date.now()}`,
          type: 'delete',
          employeeId: emp.id || emp.employeeId,
          employeeName: emp.name,
          changes: {
            status: { before: emp.status, after: 'inactive/deleted' },
            department: { before: emp.department, after: '—' },
          },
          description: `Permanently unenroll ${emp.name} (${emp.employeeId}) from ${emp.department}.`,
          confirmedStep1: false,
          confirmedStep2: false,
        },
      };
    }
  }

  // 2. Detect Modify Intent (e.g. "update Sarah department to Cloud Engineering", "change Aung phone to 09123456")
  const updateMatch = normalized.match(/(?:update|change|set|modify)\s+([a-zA-Z\s]+?)(?:'s|\s+)(department|phone|email|role|status)\s+(?:to\s+)?(.+)/i);
  if (updateMatch) {
    const targetName = updateMatch[1].trim();
    const fieldKey = updateMatch[2].toLowerCase();
    const newValue = updateMatch[3].trim().replace(/^to\s+/i, '');

    const emp = employees.find((e) => e.name.toLowerCase().includes(targetName.toLowerCase()));
    if (emp) {
      const fieldMap: Record<string, keyof Employee> = {
        department: 'department',
        phone: 'phone',
        email: 'email',
        status: 'status',
      };
      const actualField = fieldMap[fieldKey] || 'department';
      const beforeVal = emp[actualField];

      const updateReplies: Record<string, string> = {
        mm: `📝 **${emp.name}** အတွက် ပြင်ဆင်ချက်မူကြမ်းကို ရေးဆွဲထားပါသည်။ Firestore တွင် သိမ်းဆည်းရန် diff အား စစ်ဆေးအတည်ပြုပါ-`,
        zh: `📝 已为 **${emp.name}** 起草更新内容。请在提交至数据库前复核下方的安全 diff：`,
        'zh-HK': `📝 已為 **${emp.name}** 起草更新內容。請在提交至數據庫前複核下方的安全 diff：`,
        ja: `📝 **${emp.name}** さんの更新ドラフトを作成しました。データベースに保存する前に以下の差分をご確認ください：`,
        ko: `📝 **${emp.name}** 님에 대한 업데이트 초안을 준비했습니다. 데이터베이스에 반영하기 전 아래 diff를 확인해 주세요:`,
        vn: `📝 Đã tạo bản thảo cập nhật cho **${emp.name}**. Vui lòng kiểm tra và xác nhận diff trước khi lưu vào cơ sở dữ liệu:`,
      };

      return {
        reply: updateReplies[language] || `📝 I've drafted the requested update for **${emp.name}**. Please review the exact diff below and double-confirm before saving to Firestore:`,
        actionDiff: {
          id: `diff-${Date.now()}`,
          type: 'modify',
          employeeId: emp.id || emp.employeeId,
          employeeName: emp.name,
          changes: {
            [actualField]: { before: beforeVal, after: newValue },
          },
          description: `Update ${actualField} from "${beforeVal}" to "${newValue}".`,
          confirmedStep1: false,
          confirmedStep2: false,
        },
      };
    }
  }

  // 3. Natural Language Milestone Queries
  const isMilestoneQuery =
    normalized.includes('birthday') ||
    normalized.includes('anniversary') ||
    normalized.includes('milestone') ||
    normalized.includes('မွေးနေ့') ||
    normalized.includes('နှစ်ပတ်လည်') ||
    normalized.includes('生日') ||
    normalized.includes('周年') ||
    normalized.includes('週年') ||
    normalized.includes('里程碑') ||
    normalized.includes('マイルストーン') ||
    normalized.includes('誕生') ||
    normalized.includes('생일') ||
    normalized.includes('기념일') ||
    normalized.includes('sinh nhật') ||
    normalized.includes('kỷ niệm');

  if (isMilestoneQuery) {
    const today = new Date();
    const thisMonth = today.getMonth() + 1;

    const matched = employees.filter((e) => {
      const dobMonth = parseInt(e.dob.split('-')[1], 10);
      const joinMonth = parseInt(e.joinedDate.split('-')[1], 10);
      return dobMonth === thisMonth || joinMonth === thisMonth;
    });

    if (matched.length > 0) {
      const listStr = matched
        .slice(0, 5)
        .map((e) => `• **${e.name}** (${e.department}) - Joined: ${e.joinedDate}`)
        .join('\n');

      const milestoneReplies: Record<string, string> = {
        mm: `🎉 ယခုလတွင် မင်္ဂလာအခမ်းအနား ကျရောက်မည့် **ဝန်ထမ်း ${matched.length} ဦး** ကို တွေ့ရှိထားပါသည်:\n\n${listStr}\n\n၎င်းတို့အတွက် AI ဂုဏ်ပြုကတ် ဖန်တီးပေးစေလိုပါသလား?`,
        zh: `🎉 本月共有 **${matched.length} 位同仁** 迎来里程碑庆祝：\n\n${listStr}\n\n是否需要我为您定制生成 AI 庆祝贺卡？`,
        'zh-HK': `🎉 本月共有 **${matched.length} 位同仁** 迎來里程碑慶祝：\n\n${listStr}\n\n是否需要我為您定制生成 AI 慶祝賀卡？`,
        ja: `🎉 今月マイルストーンを迎える **${matched.length} 名のメンバー** が見つかりました：\n\n${listStr}\n\nAI でパーソナライズされたお祝いカードを作成しますか？`,
        ko: `🎉 이번 달 마일스톤 축하 대상자 **${matched.length}명**을 찾았습니다:\n\n${listStr}\n\n해당 임직원을 위한 AI 맞춤 축하 카드를 생성하시겠습니까?`,
        vn: `🎉 Tìm thấy **${matched.length} nhân viên** có sự kiện kỷ niệm trong tháng này:\n\n${listStr}\n\nBạn có muốn tôi tạo thiệp chúc mừng AI cho họ không?`,
      };

      return {
        reply: milestoneReplies[language] || `🎉 Found **${matched.length} employee(s)** with milestone celebrations this month:\n\n${listStr}\n\nWould you like me to customize an AI celebration card for any of them?`,
        matchedEmployees: matched,
      };
    }
  }

  // 4. Department & Location Roster Search
  const deptKeywords = [
    'engineering', 'engineer', 'sre', 'devops', 'product', 'design', 'sales', 'hr', 'marketing', 'finance',
    'singapore', 'စင်ကာပူ', 'အင်ဂျင်နီယာ', '新加坡', '工程师', '工程師', 'シンガポール', 'エンジニア', '싱가포르', '엔지니어', 'kỹ sư',
  ];
  const matchedKey = deptKeywords.find((d) => normalized.includes(d));
  if (matchedKey) {
    let filtered = employees;
    let label = matchedKey.toUpperCase();

    if (['singapore', 'စင်ကာပူ', '新加坡', 'シンガポール', '싱가포르'].includes(matchedKey)) {
      label = 'SINGAPORE / JAPAC';
      filtered = employees.filter((e) =>
        e.department.toLowerCase().includes('engineer') ||
        e.department.toLowerCase().includes('sre') ||
        e.department.toLowerCase().includes('cloud') ||
        (e as any).location?.toLowerCase().includes('singapore')
      );
      if (filtered.length === 0) filtered = employees.slice(0, 3);
    } else {
      filtered = employees.filter((e) => e.department.toLowerCase().includes(matchedKey.toLowerCase()));
      if (filtered.length === 0) filtered = employees.slice(0, 3);
    }

    const deptReplies: Record<string, string> = {
      mm: `🏢 **${label}** တွင် အဖွဲ့ဝင် **${filtered.length} ဦး** ကို တွေ့ရှိရပါသည်:\n\n` +
        filtered.slice(0, 5).map((e) => `• **${e.name}** (${e.email})`).join('\n') +
        (filtered.length > 5 ? `\n...နောက်ထပ် ${filtered.length - 5} ဦး။` : ''),
      zh: `🏢 在 **${label}** 找到 **${filtered.length} 位成员**：\n\n` +
        filtered.slice(0, 5).map((e) => `• **${e.name}** (${e.email})`).join('\n') +
        (filtered.length > 5 ? `\n...以及其他 ${filtered.length - 5} 位同仁。` : ''),
      'zh-HK': `🏢 在 **${label}** 找到 **${filtered.length} 位成員**：\n\n` +
        filtered.slice(0, 5).map((e) => `• **${e.name}** (${e.email})`).join('\n') +
        (filtered.length > 5 ? `\n...以及其他 ${filtered.length - 5} 位同仁。` : ''),
      ja: `🏢 **${label}** に **${filtered.length} 名のメンバー** が見つかりました：\n\n` +
        filtered.slice(0, 5).map((e) => `• **${e.name}** (${e.email})`).join('\n') +
        (filtered.length > 5 ? `\n...ほか ${filtered.length - 5} 名。` : ''),
      ko: `🏢 **${label}** 부문에서 **${filtered.length}명의 팀원**을 찾았습니다:\n\n` +
        filtered.slice(0, 5).map((e) => `• **${e.name}** (${e.email})`).join('\n') +
        (filtered.length > 5 ? `\n...외 ${filtered.length - 5}명.` : ''),
      vn: `🏢 Tìm thấy **${filtered.length} thành viên** trong **${label}**:\n\n` +
        filtered.slice(0, 5).map((e) => `• **${e.name}** (${e.email})`).join('\n') +
        (filtered.length > 5 ? `\n...và thêm ${filtered.length - 5} nhân viên khác.` : ''),
    };

    return {
      reply: deptReplies[language] || `🏢 Found **${filtered.length} member(s)** in **${label}**:\n\n` +
        filtered.slice(0, 5).map((e) => `• **${e.name}** (${e.email})`).join('\n') +
        (filtered.length > 5 ? `\n...and ${filtered.length - 5} more.` : ''),
      matchedEmployees: filtered,
    };
  }

  // 5. General Copilot Overview
  if (language === 'mm') {
    return {
      reply: `👋 မင်္ဂလာပါ ${userName}! ကျွန်ုပ်သည် သင်၏ **Employee Milestone & Roster Copilot** ဖြစ်ပါသည်။\n\nသင်မေးမြန်းနိုင်သည့် အကြောင်းအရာများ:\n• *"ယခုလတွင် မွေးနေ့ သို့မဟုတ် အလုပ်နှစ်ပတ်လည်ရှိသူ မည်သူနည်း?"*\n• *"စင်ကာပူရှိ အင်ဂျင်နီယာများအားလုံးကို ပြပါ"*\n• *"Sarah ၏ ဌာနကို SRE သို့ ပြောင်းပါ"* (လုံခြုံစိတ်ချရသော ၂ ဆင့် အတည်ပြု diff ပေါ်လာမည်)\n• *"OCR ဖြင့် အလိုအလျောက် သွင်းယူရန် ဝန်ထမ်းကတ် သို့မဟုတ် စာရွက်စာတမ်း ဓာတ်ပုံ တင်ပါ"*`,
    };
  }
  if (language === 'zh' || language === 'zh-HK') {
    return {
      reply: `👋 您好 ${userName}！我是您的 **员工里程碑与名册 Copilot 助手**。\n\n您可以向我询问：\n• *“本月有哪些人生日或入职周年庆？”*\n• *“显示新加坡办公室的所有工程师”*\n• *“将 Sarah 的部门更改为 SRE”*（触发安全 2 步确认 diff）\n• *“上传工牌或名册照片以通过多模态 OCR 自动导入”*`,
    };
  }
  if (language === 'ja') {
    return {
      reply: `👋 こんにちは、${userName}さん！**マイルストーン＆名簿 Copilot** です。\n\n以下のようにお気軽にご質問ください：\n• *「今月誕生日や勤続周年を迎えるメンバーは？」*\n• *「シンガポール拠点のエンジニアを一覧表示して」*\n• *「Sarahの所属部署をSREに変更」*（安全な2段階承認diffが起動します）\n• *「社員証や名簿の写真をアップロードしてOCR一括登録」*`,
    };
  }
  if (language === 'ko') {
    return {
      reply: `👋 안녕하세요, ${userName}님! **임직원 마일스톤 & 명부 Copilot**입니다.\n\n다음과 같이 자연어로 질문해 보세요:\n• *"이번 달 생일이나 입사 기념일인 직원은 누구인가요?"*\n• *"싱가포르의 모든 엔지니어 목록 보여줘"*\n• *"Sarah 부서를 SRE로 변경"* (안전한 2단계 확인 diff가 표시됩니다)\n• *"사원증이나 명부 사진을 업로드하여 OCR로 등록"*`,
    };
  }
  if (language === 'vn') {
    return {
      reply: `👋 Xin chào ${userName}! Tôi là **Trợ lý Copilot Nhân sự & Sự kiện Doanh nghiệp**.\n\nBạn có thể hỏi tôi:\n• *"Ai có sinh nhật hoặc kỷ niệm ngày làm việc trong tháng này?"*\n• *"Hiển thị tất cả kỹ sư tại Singapore"*\n• *"Đổi phòng ban của Sarah sang SRE"* (kích hoạt diff xác nhận 2 bước an toàn)\n• *"Tải lên ảnh thẻ nhân viên để tự động nhập liệu qua OCR"*`,
    };
  }

  return {
    reply: `👋 Hello ${userName}! I am your **Employee Milestone & Roster Copilot**.\n\nYou can ask me:\n• *"Who has an upcoming birthday or work anniversary this month?"*\n• *"Show all engineers in Singapore"* \n• *"Change Sarah's department to SRE"* (triggers safe 2-step confirmation diff)\n• *"Upload a photo of roster or ID card to import via OCR"*`,
  };
}

// ---------------------------------------------------------------------------
// 4. SEMANTIC EMBEDDING SEARCH SIMULATION (text-embedding-004)
// ---------------------------------------------------------------------------

export function semanticEmployeeSearch(query: string, employees: Employee[]): Employee[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return employees;

  return employees
    .map((emp) => {
      let score = 0;
      const haystack = `${emp.name} ${emp.department} ${emp.email} ${emp.phone} ${emp.dob} ${emp.joinedDate} ${JSON.stringify(emp.metadata || {})}`.toLowerCase();

      terms.forEach((term) => {
        if (haystack.includes(term)) score += 2;
        if (emp.name.toLowerCase().includes(term)) score += 3;
        if (emp.department.toLowerCase().includes(term)) score += 2.5;
      });

      return { emp, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.emp);
}

// ---------------------------------------------------------------------------
// 5. REAL GEMINI 2.5 FLASH MULTIMODAL VISION OCR DOCUMENT PARSER
// ---------------------------------------------------------------------------

export interface OcrExtractionResult {
  candidates: OcrCandidate[];
  model: string;
  isLiveApi: boolean;
  message?: string;
}

export async function extractEmployeesFromDocument({
  fileBase64,
  mimeType,
  fileName,
}: {
  fileBase64: string;
  mimeType: string;
  fileName: string;
}): Promise<OcrExtractionResult> {
  const apiKey = getGeminiApiKey();

  // If no client-side Gemini API key is configured, first attempt to call the secure
  // backend Cloud Function `extractDocumentOcr` (which uses backend GEMINI_API_KEY).
  // If backend is unavailable (e.g. offline demo mode), provide realistic sample fallback.
  if (!apiKey) {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const { fns } = await import('./firebase');
      if (fns) {
        const extractFn = httpsCallable<{ fileBase64: string; mimeType: string }, OcrExtractionResult>(
          fns,
          'extractDocumentOcr'
        );
        const res = await extractFn({ fileBase64, mimeType });
        if (res.data && Array.isArray(res.data.candidates) && res.data.candidates.length > 0) {
          return res.data;
        }
      }
    } catch (backendErr) {
      console.warn('Backend Cloud Function OCR not reachable, falling back to sample preview:', backendErr);
    }
    return {
      candidates: [
        {
          name: 'Zaw Min Tun',
          department: 'Cloud Infrastructure',
          role: 'DevOps Architect',
          email: 'zaw.min@company.com',
          phone: '+95 9 789 123 456',
          dob: '1992-06-14',
          joinedDate: '2021-04-10',
          location: 'Yangon',
          confidence: 0.94,
        },
        {
          name: 'Mei Ling Zhou',
          department: 'Product Design',
          role: 'Lead UX Researcher',
          email: 'meiling.zhou@company.com',
          phone: '+886 912 345 678',
          dob: '1994-11-28',
          joinedDate: '2022-08-15',
          location: 'Taipei',
          confidence: 0.96,
        },
        {
          name: 'Nguyen Van Hai',
          department: 'Engineering',
          role: 'Full Stack Engineer',
          email: 'hai.nguyen@company.com',
          phone: '+84 90 123 4567',
          dob: '1995-03-22',
          joinedDate: '2023-01-09',
          location: 'Ho Chi Minh City',
          confidence: 0.92,
        },
      ],
      model: 'Sample Document Heuristic (No Gemini API Key)',
      isLiveApi: false,
      message: 'Parsed sample candidate records. Configure your Gemini API key in Copilot or set VITE_GEMINI_API_KEY in .env for live Multimodal Vision.',
    };
  }

  const prompt = `You are an expert HR Document AI parser for enterprise workforce systems.
Analyze this uploaded document/image (which could be an employee badge, roster spreadsheet, ID card, business card, onboarding slip, or team roster).
Extract all individual employee records present in the document.

For each employee found, return a JSON object with:
- "name": Full name (required)
- "department": Department or functional division (e.g., Engineering, People & Culture, Cloud DevOps, Product Design, Marketing, Finance). If not explicitly visible, infer from job title.
- "role": Job title (e.g. Senior Software Engineer, HR Business Partner)
- "email": Work email address (if not found in document, infer from name and standard company domain @company.com)
- "phone": Phone number if visible (or empty string)
- "dob": Date of birth in YYYY-MM-DD or MM-DD format if visible (or estimate e.g. "1994-06-15")
- "joinedDate": Hire date or work anniversary in YYYY-MM-DD format if visible (or current year estimate e.g. "2023-05-01")
- "location": City or country if visible
- "confidence": Estimated parsing confidence between 0.0 and 1.0

Return ONLY a valid JSON array of employee objects matching this schema (no markdown formatting, no backticks, no explanatory text):
[
  {
    "name": "Alex Morgan",
    "department": "Engineering",
    "role": "Cloud Architect",
    "email": "alex.m@company.com",
    "phone": "+65 9123 4567",
    "dob": "1991-04-12",
    "joinedDate": "2021-03-01",
    "location": "Singapore",
    "confidence": 0.97
  }
]
If the image does not contain any employee data, return an empty array [].`;

  const candidateModels = await getAvailableGeminiModels(apiKey);
  // Test top candidate models (prioritizing operational flash models)
  const modelsToTry = candidateModels.slice(0, 6);
  let lastError: any = null;

  for (const model of modelsToTry) {
    // Try v1beta first, then fallback to v1 if needed
    const apiVersions = ['v1beta', 'v1'];
    for (const apiVersion of apiVersions) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: mimeType || 'image/jpeg',
                        data: fileBase64,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (!response.ok) {
          const rawErr = await response.text();
          let parsedMsg = rawErr;
          try {
            const errObj = JSON.parse(rawErr);
            parsedMsg = errObj?.error?.message || rawErr;
          } catch {}

          // If 404 (model retired/unsupported), 503 (high demand spike), or 429 (tier quota limit), try next candidate model
          if (response.status === 404 || response.status === 503 || response.status === 429) {
            lastError = new Error(`Model ${model} (${apiVersion}): ${parsedMsg}`);
            continue;
          }

          // If API key is invalid (400), stop early with clear diagnostic error
          throw new Error(`Gemini Vision API error (${response.status}): ${parsedMsg}`);
        }

        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          let parsed: any;
          try {
            parsed = JSON.parse(cleaned);
          } catch {
            const jsonMatch = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
            if (jsonMatch) {
              parsed = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error('Gemini response could not be parsed into a JSON employee array.');
            }
          }

          const candidates: OcrCandidate[] = (Array.isArray(parsed) ? parsed : [parsed]).filter(
            (c) => c && typeof c.name === 'string' && c.name.trim().length > 0
          );

          return {
            candidates,
            model: `Gemini Multimodal (${model})`,
            isLiveApi: true,
          };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt with ${model} on ${apiVersion} failed:`, err?.message || err);
        // If it's an explicit API key invalid error, surface it directly
        if (err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('400')) {
          throw err;
        }
      }
    }
  }

  throw lastError || new Error(`Failed to extract employee records from ${fileName}.`);
}

