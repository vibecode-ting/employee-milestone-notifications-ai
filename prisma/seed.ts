import { PrismaClient } from '@prisma/client';
import { addDays, setYear } from 'date-fns';

const prisma = new PrismaClient();

const TODAY = new Date();

function todayBirthDate(): Date {
  return new Date(TODAY.getFullYear() - 30, TODAY.getMonth(), TODAY.getDate());
}

function todayHireDate(yearsAgo: number): Date {
  return new Date(TODAY.getFullYear() - yearsAgo, TODAY.getMonth(), TODAY.getDate());
}

const defaultCustomColumns = JSON.stringify([
  { key: 'nickname', label: 'Nickname', type: 'text', useInAiPrompt: true },
  { key: 'hobbies', label: 'Hobbies & Interests', type: 'tags', useInAiPrompt: true },
  { key: 'recent_win', label: 'Recent Key Achievement', type: 'text', useInAiPrompt: true },
  { key: 'favorite_treat', label: 'Favorite Cake/Snack', type: 'text', useInAiPrompt: true },
  { key: 'office_city', label: 'Office Location', type: 'select', useInAiPrompt: true },
]);

const employees = [
  // === 2 employees with TODAY's milestones ===
  {
    fullName: 'Aung Kyaw Zin',
    email: 'aung.kyaw.zin@acme-japac.com',
    birthDate: todayBirthDate(),
    hireDate: new Date(TODAY.getFullYear() - 5, TODAY.getMonth() - 3, 10),
    role: 'Senior Software Engineer',
    department: 'Engineering',
    managerEmail: 'cto@acme-japac.com',
    preferredLanguage: 'English',
    customAttributes: JSON.stringify({
      nickname: 'AKZ',
      hobbies: 'Photography, Rock Climbing, Street Food Hunting',
      recent_win: 'Led the migration to microservices architecture, cutting deployment time by 60%',
      favorite_treat: 'Mohinga (Myanmar Fish Noodle Soup)',
      office_city: 'Yangon',
    }),
  },
  {
    fullName: 'Priya Chandrasekaran',
    email: 'priya.c@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 28, TODAY.getMonth() - 1, 15),
    hireDate: todayHireDate(3),
    role: 'Product Manager',
    department: 'Product',
    managerEmail: 'cpo@acme-japac.com',
    preferredLanguage: 'English',
    customAttributes: JSON.stringify({
      nickname: 'Pri',
      hobbies: 'Classical Dance (Bharatanatyam), Cooking, Reading Sci-Fi',
      recent_win: 'Successfully launched the AI-powered analytics dashboard with 98% user satisfaction',
      favorite_treat: 'Mysore Pak and Masala Chai',
      office_city: 'Bangalore',
    }),
  },
  // === Additional JAPAC Employees ===
  {
    fullName: 'Yuki Tanaka',
    email: 'yuki.tanaka@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 32, 2, 15),
    hireDate: new Date(TODAY.getFullYear() - 7, 3, 1),
    role: 'UX Design Lead',
    department: 'Design',
    managerEmail: 'cdo@acme-japac.com',
    preferredLanguage: 'Japanese',
    customAttributes: JSON.stringify({
      nickname: 'Yuki-chan',
      hobbies: 'Ikebana, Watercolor Painting, Hiking',
      recent_win: 'Won the Red Dot Design Award for the mobile app redesign',
      favorite_treat: 'Matcha Tiramisu',
      office_city: 'Tokyo',
    }),
  },
  {
    fullName: 'Wei Chen',
    email: 'wei.chen@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 35, 5, 20),
    hireDate: new Date(TODAY.getFullYear() - 10, 0, 15),
    role: 'Engineering Manager',
    department: 'Engineering',
    managerEmail: 'cto@acme-japac.com',
    preferredLanguage: 'Chinese',
    customAttributes: JSON.stringify({
      nickname: 'Winston',
      hobbies: 'Table Tennis, Go (Board Game), Cooking Dim Sum',
      recent_win: 'Grew engineering team from 5 to 25 engineers with 95% retention rate',
      favorite_treat: 'Wife Cake (Lao Po Bing)',
      office_city: 'Singapore',
    }),
  },
  {
    fullName: 'Siti Rahayu',
    email: 'siti.rahayu@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 27, 8, 10),
    hireDate: new Date(TODAY.getFullYear() - 2, 6, 1),
    role: 'Data Scientist',
    department: 'Data & Analytics',
    managerEmail: 'cdo@acme-japac.com',
    preferredLanguage: 'English',
    customAttributes: JSON.stringify({
      nickname: 'Siti',
      hobbies: 'Batik Painting, Rock Climbing, Podcast Hosting',
      recent_win: 'Built ML model that improved customer churn prediction accuracy by 40%',
      favorite_treat: 'Ondeh-Ondeh Cake',
      office_city: 'Singapore',
    }),
  },
  {
    fullName: 'Rahul Mehta',
    email: 'rahul.mehta@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 30, 11, 5),
    hireDate: new Date(TODAY.getFullYear() - 4, 2, 15),
    role: 'DevOps Engineer',
    department: 'Engineering',
    managerEmail: 'cto@acme-japac.com',
    preferredLanguage: 'Hindi',
    customAttributes: JSON.stringify({
      nickname: 'Rah',
      hobbies: 'Cricket, Tabla Drumming, Cloud Architecture Blogging',
      recent_win: 'Achieved 99.99% uptime by redesigning the Kubernetes deployment pipeline',
      favorite_treat: 'Gulab Jamun and Chai',
      office_city: 'Bangalore',
    }),
  },
  {
    fullName: 'Min Thu Khaing',
    email: 'minthu.khaing@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 26, 3, 22),
    hireDate: new Date(TODAY.getFullYear() - 1, 9, 1),
    role: 'Frontend Developer',
    department: 'Engineering',
    managerEmail: 'wei.chen@acme-japac.com',
    preferredLanguage: 'English',
    customAttributes: JSON.stringify({
      nickname: 'Min',
      hobbies: 'Digital Art, Gaming, Learning Japanese',
      recent_win: 'Reduced app bundle size by 45% enabling 3x faster load times on mobile',
      favorite_treat: 'Shwe Yin Aye (Myanmar Coconut Dessert)',
      office_city: 'Yangon',
    }),
  },
  {
    fullName: 'Ananya Krishnamurthy',
    email: 'ananya.k@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 29, 6, 18),
    hireDate: new Date(TODAY.getFullYear() - 6, 4, 10),
    role: 'HR Business Partner',
    department: 'People & Culture',
    managerEmail: 'chro@acme-japac.com',
    preferredLanguage: 'English',
    customAttributes: JSON.stringify({
      nickname: 'Anu',
      hobbies: 'Yoga, Book Club, Volunteering at Animal Shelters',
      recent_win: 'Implemented new onboarding program reducing time-to-productivity by 30%',
      favorite_treat: 'Mysore Silk Cake',
      office_city: 'Bangalore',
    }),
  },
  {
    fullName: 'Kenji Watanabe',
    email: 'kenji.watanabe@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 40, 1, 28),
    hireDate: new Date(TODAY.getFullYear() - 12, 7, 1),
    role: 'Chief Technology Officer',
    department: 'Executive',
    managerEmail: 'ceo@acme-japac.com',
    preferredLanguage: 'Japanese',
    customAttributes: JSON.stringify({
      nickname: 'KW',
      hobbies: 'Kendo, Bonsai, Reading Philosophy',
      recent_win: 'Led successful Series B fundraising with $50M for AI product expansion',
      favorite_treat: 'Wagashi (Japanese Sweets)',
      office_city: 'Tokyo',
    }),
  },
  {
    fullName: 'Fatimah Al-Rashidi',
    email: 'fatimah.rashidi@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 33, 4, 12),
    hireDate: new Date(TODAY.getFullYear() - 5, 10, 20),
    role: 'Marketing Director',
    department: 'Marketing',
    managerEmail: 'cmo@acme-japac.com',
    preferredLanguage: 'English',
    customAttributes: JSON.stringify({
      nickname: 'Fati',
      hobbies: 'Calligraphy, Pottery, Travel Photography',
      recent_win: 'Grew JAPAC brand awareness by 200% through AI-driven content campaign',
      favorite_treat: 'Mango Sticky Rice',
      office_city: 'Singapore',
    }),
  },
  {
    fullName: 'Arjun Nair',
    email: 'arjun.nair@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 31, 9, 7),
    hireDate: new Date(TODAY.getFullYear() - 3, 1, 1),
    role: 'Backend Engineer',
    department: 'Engineering',
    managerEmail: 'wei.chen@acme-japac.com',
    preferredLanguage: 'English',
    customAttributes: JSON.stringify({
      nickname: 'Arju',
      hobbies: 'Badminton, Cooking Kerala Cuisine, Open Source Contributions',
      recent_win: 'Designed and built the real-time notification system handling 1M events/day',
      favorite_treat: 'Kerala Banana Chips and Payasam',
      office_city: 'Bangalore',
    }),
  },
  {
    fullName: 'Mei Lin Zhang',
    email: 'meilin.zhang@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 28, 7, 30),
    hireDate: new Date(TODAY.getFullYear() - 2, 3, 15),
    role: 'Customer Success Manager',
    department: 'Customer Success',
    managerEmail: 'cco@acme-japac.com',
    preferredLanguage: 'Chinese',
    customAttributes: JSON.stringify({
      nickname: 'Mei',
      hobbies: 'Piano, Cooking Cantonese Dim Sum, Marathon Running',
      recent_win: 'Achieved 100% NPS score from Top 10 enterprise accounts for Q3',
      favorite_treat: 'Egg Tarts and Red Bean Soup',
      office_city: 'Singapore',
    }),
  },
  {
    fullName: 'Thida Myint',
    email: 'thida.myint@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 25, 0, 3),
    hireDate: new Date(TODAY.getFullYear() - 1, 1, 10),
    role: 'QA Engineer',
    department: 'Engineering',
    managerEmail: 'wei.chen@acme-japac.com',
    preferredLanguage: 'English',
    customAttributes: JSON.stringify({
      nickname: 'Thida',
      hobbies: 'Lacquerware Crafting, Watching Anime, Gardening',
      recent_win: 'Built automated test suite covering 90% of codebase, eliminating all regression bugs',
      favorite_treat: 'Htamanè (Glutinous Rice Pudding)',
      office_city: 'Yangon',
    }),
  },
  {
    fullName: 'Raj Sundaram',
    email: 'raj.sundaram@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 45, 5, 15),
    hireDate: new Date(TODAY.getFullYear() - 15, 8, 1),
    role: 'Chief Executive Officer',
    department: 'Executive',
    managerEmail: 'board@acme-japac.com',
    preferredLanguage: 'English',
    customAttributes: JSON.stringify({
      nickname: 'Raj',
      hobbies: 'Golf, Sailing, Mentoring Young Entrepreneurs',
      recent_win: 'Closed strategic partnership with Google Cloud JAPAC worth $5M ARR',
      favorite_treat: 'Chettinad Sweets',
      office_city: 'Singapore',
    }),
  },
  {
    fullName: 'Hana Suzuki',
    email: 'hana.suzuki@acme-japac.com',
    birthDate: new Date(TODAY.getFullYear() - 24, 10, 20),
    hireDate: new Date(TODAY.getFullYear() - 1, 5, 1),
    role: 'AI/ML Engineer',
    department: 'Engineering',
    managerEmail: 'kenji.watanabe@acme-japac.com',
    preferredLanguage: 'Japanese',
    customAttributes: JSON.stringify({
      nickname: 'Hana',
      hobbies: 'Robotics, Tea Ceremony, K-Drama',
      recent_win: 'Published research paper on multimodal AI accepted at NeurIPS 2025',
      favorite_treat: 'Dorayaki and Mochi Ice Cream',
      office_city: 'Tokyo',
    }),
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Upsert AppSettings
  await prisma.appSettings.upsert({
    where: { id: 'default_org' },
    update: {},
    create: {
      id: 'default_org',
      companyName: 'Acme JAPAC Technologies',
      timezone: 'Asia/Singapore',
      dailyTriggerTime: '08:30',
      enableAutoEmail: true,
      emailProvider: 'ethereal_sandbox',
      senderName: 'People & Culture AI',
      aiTone: 'warm_professional',
      cardVisualStyle: 'modern_gradient',
      useImagenBackground: false,
      defaultGiftBudgetUsd: 50,
      customColumnSchema: defaultCustomColumns,
    },
  });

  // Seed employees
  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { email: emp.email },
      update: emp,
      create: emp,
    });
  }

  const count = await prisma.employee.count();
  console.log(`✅ Seeded ${count} employees successfully!`);
  console.log('🎉 Two employees have milestones TODAY:', employees[0].fullName, '(Birthday) &', employees[1].fullName, '(Work Anniversary)');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
