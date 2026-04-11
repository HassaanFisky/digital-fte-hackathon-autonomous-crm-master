export type Translation = typeof en;

export const en = {
  name: "English",
  short: "EN",
  dir: "ltr",
  ui: {
    network: "Member Area",
    uplink: "Connect Identity",
    architect: "Verified Member",
    terminate: "Sign Out",
    ecosystem: "Project Hub",
    status: "Status: Online",
    production: "Active",
    language: "Language",
    snow: "Snow Mode",
    companion: "AI Assistant",
    notebook: "Notes",
  },
  auth: {
    greeting: "Welcome to Aira Autonomous CRM. Agents are standing by.",
  },
};

export const ur = {
  name: "اردو",
  short: "UR",
  dir: "rtl",
  ui: {
    network: "ممبر ایریا",
    uplink: "شناخت جوڑیں",
    architect: "تصدیق شدہ ممبر",
    terminate: "سائن آؤٹ",
    ecosystem: "پروجیکٹ حب",
    status: "اسٹیٹس: آن لائن",
    production: "فعال",
    language: "زبان",
    snow: "برفانی موڈ",
    companion: "اے آئی اسسٹنٹ",
    notebook: "نوٹس",
  },
  auth: {
    greeting: "آئرا خود مختار سی آر ایم میں خوش آمدید۔ ایجنٹ تیار ہیں۔",
  },
};

export const ro = {
  name: "Roman Urdu",
  short: "RO",
  dir: "ltr",
  ui: {
    network: "Member Area",
    uplink: "Identity Connect",
    architect: "Verified Member",
    terminate: "Sign Out",
    ecosystem: "Project Hub",
    status: "Status: Online",
    production: "Active",
    language: "Zubaan",
    snow: "Snow Mode",
    companion: "AI Assistant",
    notebook: "Notes",
  },
  auth: {
    greeting: "Aira Autonomous CRM mein khush amdeed. Agents tayyar hain.",
  },
};

export const dictionaries = {
  en,
  ur,
  ro,
};
