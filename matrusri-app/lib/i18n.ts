/**
 * Lightweight translation lookup.
 * Used for data strings (task names, status badges) and common buttons.
 * UI chrome (page titles, form labels) stays in English.
 */

export type Lang = "en" | "te" | "hi";

export const LANG_LABEL: Record<Lang, string> = {
  en: "English",
  te: "తెలుగు",
  hi: "हिंदी",
};

// Each key maps to { en, te, hi }. Lookup by key + user's language.
export const T: Record<string, Record<Lang, string>> = {
  // ── Task names (19) ────────────────────────────────────────────────
  "Fans OFF": {
    en: "Fans OFF",
    te: "ఫ్యాన్లు ఆఫ్ చేయండి",
    hi: "पंखे बंद करें",
  },
  "Bore pump ON": {
    en: "Bore pump ON",
    te: "బోర్ పంప్ ఆన్ చేయండి",
    hi: "बोर पंप चालू करें",
  },
  "Bore pump OFF": {
    en: "Bore pump OFF",
    te: "బోర్ పంప్ ఆఫ్ చేయండి",
    hi: "बोर पंप बंद करें",
  },
  "Yoga photo": {
    en: "Yoga photo",
    te: "యోగా ఫోటో",
    hi: "योग की फोटो",
  },
  "Attendance #1 — Study hall": {
    en: "Attendance #1 — Study hall",
    te: "హాజరు #1 – స్టడీ హాల్",
    hi: "उपस्थिति #1 – स्टडी हॉल",
  },
  "Attendance #2 — School interval": {
    en: "Attendance #2 — School interval",
    te: "హాజరు #2 – విరామ సమయం",
    hi: "उपस्थिति #2 – अवकाश",
  },
  "Attendance #3 — Lunch": {
    en: "Attendance #3 — Lunch",
    te: "హాజరు #3 – మధ్యాహ్న భోజనం",
    hi: "उपस्थिति #3 – दोपहर का भोजन",
  },
  "Attendance #4": {
    en: "Attendance #4",
    te: "హాజరు #4",
    hi: "उपस्थिति #4",
  },
  "Attendance #5 — Day close": {
    en: "Attendance #5 — Day close",
    te: "హాజరు #5 – రోజు ముగింపు",
    hi: "उपस्थिति #5 – दिन समाप्ति",
  },
  "Room lock confirmation": {
    en: "Room lock confirmation",
    te: "గది తాళం వేసినట్లు నిర్ధారించండి",
    hi: "कमरे का ताला कन्फर्म करें",
  },
  "Breakfast wastage photo": {
    en: "Breakfast wastage photo",
    te: "అల్పాహార వృథా ఫోటో",
    hi: "नाश्ते की बर्बादी की फोटो",
  },
  "Lunch wastage photo": {
    en: "Lunch wastage photo",
    te: "మధ్యాహ్న భోజన వృథా ఫోటో",
    hi: "दोपहर के भोजन की बर्बादी की फोटो",
  },
  "Snacks wastage photo": {
    en: "Snacks wastage photo",
    te: "స్నాక్స్ వృథా ఫోటో",
    hi: "स्नैक्स की बर्बादी की फोटो",
  },
  "Dinner wastage photo": {
    en: "Dinner wastage photo",
    te: "రాత్రి భోజన వృథా ఫోటో",
    hi: "रात के भोजन की बर्बादी की फोटो",
  },
  "Sick check + snacks": {
    en: "Sick check + snacks",
    te: "అనారోగ్య విద్యార్థుల తనిఖీ + స్నాక్స్",
    hi: "बीमार छात्रों की जांच + स्नैक्स",
  },
  "Evening study hall": {
    en: "Evening study hall",
    te: "సాయంత్రం స్టడీ హాల్",
    hi: "शाम का स्टडी हॉल",
  },
  "Dining + Learning hall photos": {
    en: "Dining + Learning hall photos",
    te: "డైనింగ్ హాల్ & లెర్నింగ్ హాల్ ఫోటోలు",
    hi: "डाइनिंग हॉल और लर्निंग हॉल की फोटो",
  },
  "Laundry distribution": {
    en: "Laundry distribution",
    te: "ఉతికిన బట్టల పంపిణీ",
    hi: "धुले हुए कपड़ों का वितरण",
  },
  "Water pump OFF photo": {
    en: "Water pump OFF photo",
    te: "వాటర్ పంప్ ఆఫ్ చేసిన ఫోటో",
    hi: "पानी का पंप बंद होने की फोटो",
  },

  // ── Task status badges ─────────────────────────────────────────────
  Open: { en: "Open",       te: "తెరిచి ఉంది",       hi: "खुला" },
  "Open now": { en: "Open now", te: "ఇప్పుడు చేయండి",  hi: "अभी करें" },
  Done: { en: "Done",       te: "పూర్తైంది",          hi: "पूरा हुआ" },
  Missed: { en: "Missed",   te: "మిస్ అయింది",        hi: "छूट गया" },
  Upcoming: { en: "Upcoming", te: "రాబోతోంది",        hi: "आने वाला" },

  // ── Sick log states ────────────────────────────────────────────────
  Reported: { en: "Reported", te: "నమోదు చేశారు", hi: "दर्ज किया गया" },
  "Parent called": {
    en: "Parent called",
    te: "తల్లిదండ్రులకు ఫోన్ చేశారు",
    hi: "अभिभावकों को फोन किया",
  },
  "Call parent!": {
    en: "Call parent!",
    te: "తల్లిదండ్రులకు వెంటనే ఫోన్ చేయండి",
    hi: "अभिभावकों को तुरंत फोन करें",
  },
  Recovered: { en: "Recovered", te: "కోలుకున్నారు", hi: "ठीक हो गया" },
  "Resting in hostel": {
    en: "Resting in hostel",
    te: "హాస్టల్‌లో విశ్రాంతి తీసుకుంటున్నారు",
    hi: "हॉस्टल में आराम कर रहा/रही है",
  },

  // ── Outing types (simplified to 2) ─────────────────────────────────
  Sick: { en: "Sick", te: "అనారోగ్యం", hi: "बीमार" },
  Outing: { en: "Outing", te: "బయటకు వెళ్లడం", hi: "बाहर जाना" },

  // ── Laundry issue types ────────────────────────────────────────────
  Missing: { en: "Missing", te: "కనిపించలేదు", hi: "गायब" },
  Damaged: { en: "Damaged", te: "పాడైంది", hi: "खराब" },
  Uncollected: {
    en: "Uncollected",
    te: "తీసుకెళ్లలేదు",
    hi: "नहीं लिया गया",
  },
  Other: { en: "Other", te: "ఇతర", hi: "अन्य" },

  // ── Common buttons ─────────────────────────────────────────────────
  Confirm: { en: "Confirm", te: "నిర్ధారించండి", hi: "कन्फर्म करें" },
  Submit: { en: "Submit", te: "సమర్పించండి", hi: "सबमिट करें" },
  Save: { en: "Save", te: "సేవ్ చేయండి", hi: "सेव करें" },
  "Upload photo": {
    en: "Upload photo",
    te: "ఫోటో అప్‌లోడ్ చేయండి",
    hi: "फोटो अपलोड करें",
  },
  "Take photo": {
    en: "Take photo",
    te: "ఫోటో తీయండి",
    hi: "फोटो लें",
  },
  Cancel: { en: "Cancel", te: "రద్దు చేయండి", hi: "कैंसल करें" },

  // ── Mark done variants used on action page ─────────────────────────
  "Mark done": { en: "Mark done", te: "పూర్తైనట్లు గుర్తు పెట్టండి", hi: "पूरा हुआ चिह्नित करें" },
};

/**
 * Look up a translation. If the key isn't in the map, returns the key itself
 * (so untranslated strings still display in English).
 */
export function t(key: string, lang: Lang): string {
  return T[key]?.[lang] ?? key;
}
