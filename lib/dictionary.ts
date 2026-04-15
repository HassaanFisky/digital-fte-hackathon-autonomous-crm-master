/**
 * HASSAAN AI ARCHITECT — Human-style Dictionary System
 * Language Protocol: English (en), Urdu (ur), Roman Urdu (ru)
 */

export type Language = "en" | "ur" | "ru";

export const translations = {
  en: {
    nav: {
      portfolio:  "Portfolio Hub",
      support:    "Support Terminal",
      dashboard:  "Network Dashboard",
      docs:       "Core Specs",
      submit:     "SUBMIT REQUEST",
    },
    hero: {
      badge:        "Autonomous Mastery Node v4.0",
      title:        "Support that feels",
      titleAccent:  "beautifully human.",
      description:
        "The Companion FTE bridges the gap between efficiency and empathy. Deploy intelligent agents that resolve tickets across all channels while preserving your brand's warmth.",
      getStarted:   "Initialize Uplink",
      viewDashboard:"View Monitor",
    },
    features: {
      title:    "Infrastructure",
      subtitle: "Thoughtful architecture",
      description:
        "Built with care to handle your most delicate customer interactions with precision and empathy.",
      items: [
        {
          title: "Thoughtful Intelligence",
          desc:  "The specialist reads every message with nuance, drafting responses that are deeply contextual and empathetic.",
        },
        {
          title: "Human in the Loop",
          desc:  "Designed to collaborate. Your team retains full control while the system handles the repetitive inquiries.",
        },
        {
          title: "Organic Growth",
          desc:  "The system learns from your best agents, organically adapting to your unique voice and policies.",
        },
      ],
    },
    aira: {
      greeting:    "Greetings, Architect. I am Aira, your specialized assistant for the Digital FTE platform. How can I facilitate your productivity today?",
      placeholder: "Sync query…",
      status:      "Analyzing protocol…",
      typing:      "Aira is thinking…",
    },
    ui: {
      language:  "Language",
      snow:      "Atmosphere",
      companion: "Aira Chat",
      notebook:  "Notebook",
    },
    companion: {
      newChat:     "New Chat",
      chats:       "Chats",
      thinking:    "Aira is thinking…",
      clearChat:   "Clear chat",
      placeholder: "Type a message…",
      collapse:    "Collapse sidebar",
      expand:      "Expand sidebar",
      onDevice:    "On-Device",
      cloud:       "Cloud",
      protocol:    "Protocol",
      notes:       "Notebook",
      localSync:   "Local Sync",
      notesHint:   "Notes are auto-synced to your local node.",
    },
  },

  ur: {
    nav: {
      portfolio:  "پورٹ فولیو ہب",
      support:    "سپورٹ ٹرمینل",
      dashboard:  "نیٹ ورک ڈیش بورڈ",
      docs:       "بنیادی تفصیلات",
      submit:     "درخواست جمع کریں",
    },
    hero: {
      badge:        "خود مختار مہارت نوڈ ورژن 4.0",
      title:        "سپورٹ جو محسوس ہو",
      titleAccent:  "خوبصورتی سے انسانی۔",
      description:
        "کمپینین ایف ٹی ای کارکردگی اور ہمدردی کے درمیان فرق کو ختم کرتا ہے۔ ایسے ذہین ایجنٹس تعینات کریں جو آپ کے برانڈ کی گرمجوشی کو برقرار رکھتے ہوئے تمام چینلز پر ٹکٹ حل کریں۔",
      getStarted:   "اپ لنک شروع کریں",
      viewDashboard:"مانیٹر دیکھیں",
    },
    features: {
      title:    "انفراسٹرکچر",
      subtitle: "سوچی سمجھی آرکیٹیکچر",
      description:
        "آپ کے انتہائی نازک کسٹمر تعاملات کو درستگی اور ہمدردی کے ساتھ سنبھالنے کے لئے احتیاط سے بنایا گیا ہے۔",
      items: [
        {
          title: "سوچی سمجھی ذہانت",
          desc:  "ماہر ہر پیغام کو باریکی سے پڑھتا ہے، ایسے جوابات تیار کرتا ہے جو گہرے سیاق و سباق اور ہمدردی پر مبنی ہوں۔",
        },
        {
          title: "انسانی شمولیت",
          desc:  "تعاون کے لئے ڈیزائن کیا گیا ہے۔ آپ کی ٹیم مکمل کنٹرول برقرار رکھتی ہے جبکہ سسٹم بار بار آنے والی پوچھ گچھ کو سنبھالتا ہے۔",
        },
        {
          title: "قدرتی ترقی",
          desc:  "سسٹم آپ کے بہترین ایجنٹوں سے سیکھتا ہے، قدرتی طور پر آپ کی منفرد آواز اور پالیسیوں کے مطابق ڈھل جاتا ہے۔",
        },
      ],
    },
    aira: {
      greeting:    "آداب، آرکیٹیکٹ۔ میں ائیرا ہوں، ڈیجیٹل ایف ٹی ای پلیٹ فارم کے لئے آپ کی مخصوص معاون۔ میں آج آپ کی پیداواری صلاحیت میں کیسے سہولت فراہم کر سکتی ہوں؟",
      placeholder: "سوال لکھیں…",
      status:      "پروٹوکول کا تجزیہ جاری ہے…",
      typing:      "ائیرا سوچ رہی ہے…",
    },
    ui: {
      language:  "زبان",
      snow:      "ماحول",
      companion: "ائیرا چیٹ",
      notebook:  "نوٹ بک",
    },
    companion: {
      newChat:     "نئی بات چیت",
      chats:       "بات چیت",
      thinking:    "ائیرا سوچ رہی ہے…",
      clearChat:   "بات چیت صاف کریں",
      placeholder: "پیغام لکھیں…",
      collapse:    "سائڈبار بند کریں",
      expand:      "سائڈبار کھولیں",
      onDevice:    "آن ڈیوائس",
      cloud:       "کلاؤڈ",
      protocol:    "پروٹوکول",
      notes:       "نوٹ بک",
      localSync:   "مقامی ہم آہنگی",
      notesHint:   "نوٹس آپ کے مقامی نوڈ سے خود بخود ہم آہنگ ہیں۔",
    },
  },

  ru: {
    nav: {
      portfolio:  "Portfolio Hub",
      support:    "Support Terminal",
      dashboard:  "Network Dashboard",
      docs:       "Core Specs",
      submit:     "REQUEST SUBMIT KAREIN",
    },
    hero: {
      badge:        "Autonomous Mastery Node v4.0",
      title:        "Support jo mehsoos ho",
      titleAccent:  "khoobsurti se insani.",
      description:
        "Companion FTE efficiency aur empathy ke darmiyan farq ko khatam karta hai. Aisay intelligent agents deploy karein jo aap ke brand ki garmajosh ko barqarar rakhte hue tamam channels par tickets resolve karein.",
      getStarted:   "Uplink Shuru Karein",
      viewDashboard:"Monitor Dekhein",
    },
    features: {
      title:    "Infrastructure",
      subtitle: "Sochi samjhi architecture",
      description:
        "Aap ke intehai nazuk customer interactions ko darustagi aur hamdardi ke sath sambhalnay ke liye aehtiyat se banaya gaya hai.",
      items: [
        {
          title: "Sochi Samjhi Zihanat",
          desc:  "Specialist har paigham ko bariki se parhta hai, aisay jawab tayyar karta hai jo gehre context aur empathy par mabni hon.",
        },
        {
          title: "Insani Shomuliyat",
          desc:  "Collaboration ke liye design kiya gaya hai. Aap ki team mukammal control rakhti hai jabke system bar bar anay wali inquiries ko sambhalta hai.",
        },
        {
          title: "Organic Taraqqi",
          desc:  "System aap ke behtareen agents se seekhta hai, organically aap ki unique voice aur policies ke mutabiq dhal jata hai.",
        },
      ],
    },
    aira: {
      greeting:    "Aadaab, Architect. Main Aira hoon, Digital FTE platform ke liye aap ki specialized assistant. Main aaj aap ki productivity mein kaise madad kar sakti hoon?",
      placeholder: "Sawal likhein…",
      status:      "Protocol analyze ho raha hai…",
      typing:      "Aira soch rahi hai…",
    },
    ui: {
      language:  "Zaban",
      snow:      "Mahol",
      companion: "Aira Chat",
      notebook:  "Notebook",
    },
    companion: {
      newChat:     "Nayi Baat Cheet",
      chats:       "Baat Cheet",
      thinking:    "Aira soch rahi hai…",
      clearChat:   "Baat cheet saaf karein",
      placeholder: "Paigham likhein…",
      collapse:    "Sidebar band karein",
      expand:      "Sidebar kholein",
      onDevice:    "On-Device",
      cloud:       "Cloud",
      protocol:    "Protocol",
      notes:       "Notebook",
      localSync:   "Local Sync",
      notesHint:   "Notes aap ke local node se auto-sync hain.",
    },
  },
};
