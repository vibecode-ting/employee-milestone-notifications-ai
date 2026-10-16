import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      Dashboard: 'Dashboard',
      Employees: 'Employees',
      Settings: 'Settings',
      Pricing: 'Pricing',
      'User Management': 'User Management',
      'Sign Out': 'Sign Out',
      'Upgrade to PRO': 'Upgrade to PRO',
      'Total Employees': 'Total Employees',
      'Upcoming Milestones': 'Upcoming Milestones',
      'Active Alerts': 'Active Alerts',
      'Dashboard Overview': 'Dashboard Overview',
      Plan: 'Plan',
      Language: 'Language',
      'Dark Mode': 'Dark Mode',
      'Light Mode': 'Light Mode',
      'Happening Today': 'Happening Today',
    },
  },
  mm: {
    translation: {
      Dashboard: 'ဒက်ရှ်ဘုတ်',
      Employees: 'ဝန်ထမ်းများ',
      Settings: 'ဆက်တင်များ',
      Pricing: 'စျေးနှုန်း',
      'User Management': 'အသုံးပြုသူစီမံခန့်ခွဲမှု',
      'Sign Out': 'ထွက်သည်',
      'Upgrade to PRO': 'PRO သို့ အဆင့်မြှင့်ရန်',
      'Total Employees': 'ဝန်ထမ်းစုစုပေါင်း',
      'Upcoming Milestones': 'လာမည့် မှတ်တိုင်များ',
      'Active Alerts': 'တက်ကြွသော သတိပေးချက်များ',
      'Dashboard Overview': 'ဒက်ရှ်ဘုတ် အကျဉ်းချုပ်',
      Plan: 'အစီအစဉ်',
      Language: 'ဘာသာစကား',
      'Dark Mode': 'မောင်းမဲသောမုဒ်',
      'Light Mode': 'အလင်းမုဒ်',
      'Happening Today': 'ယနေ့ ဖြစ်ပျက်နေသည်',
    },
  },
  zh: {
    translation: {
      Dashboard: '儀表板',
      Employees: '員工',
      Settings: '設定',
      Pricing: '定價',
      'User Management': '用戶管理',
      'Sign Out': '登出',
      'Upgrade to PRO': '升級至 PRO',
      'Total Employees': '員工總數',
      'Upcoming Milestones': '即將到來的里程碑',
      'Active Alerts': '活躍提醒',
      'Dashboard Overview': '儀表板概覽',
      Plan: '方案',
      Language: '語言',
      'Dark Mode': '深色模式',
      'Light Mode': '淺色模式',
      'Happening Today': '今日活動',
    },
  },
  vn: {
    translation: {
      Dashboard: 'Bảng điều khiển',
      Employees: 'Nhân viên',
      Settings: 'Cài đặt',
      Pricing: 'Bảng giá',
      'User Management': 'Quản lý người dùng',
      'Sign Out': 'Đăng xuất',
      'Upgrade to PRO': 'Nâng cấp lên PRO',
      'Total Employees': 'Tổng nhân viên',
      'Upcoming Milestones': 'Cột mốc sắp tới',
      'Active Alerts': 'Cảnh báo đang hoạt động',
      'Dashboard Overview': 'Tổng quan bảng điều khiển',
      Plan: 'Gói',
      Language: 'Ngôn ngữ',
      'Dark Mode': 'Chế độ tối',
      'Light Mode': 'Chế độ sáng',
      'Happening Today': 'Hôm nay',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export const LOCALES = [
  { code: 'en', flag: '🇺🇸' },
  { code: 'mm', flag: '🇲🇲' },
  { code: 'zh', flag: '🇹🇼' },
  { code: 'vn', flag: '🇻🇳' },
] as const;

export default i18n;
