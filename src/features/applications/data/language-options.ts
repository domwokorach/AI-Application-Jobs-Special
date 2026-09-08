export interface LanguageOption {
  code: string;
  label: string;
  type: "SPOKEN" | "SIGNED" | "OTHER";
}

export const languageOptions: LanguageOption[] = [
  ["en", "English"], ["cy", "Welsh"], ["ga", "Irish"], ["gd", "Scottish Gaelic"],
  ["es", "Spanish"], ["fr", "French"], ["de", "German"], ["it", "Italian"], ["pt", "Portuguese"], ["nl", "Dutch"], ["pl", "Polish"], ["ro", "Romanian"], ["uk", "Ukrainian"], ["ru", "Russian"], ["el", "Greek"], ["tr", "Turkish"],
  ["ar", "Arabic"], ["he", "Hebrew"], ["fa", "Persian / Farsi"], ["ku", "Kurdish"],
  ["hi", "Hindi"], ["ur", "Urdu"], ["pa", "Punjabi"], ["bn", "Bengali"], ["gu", "Gujarati"], ["ta", "Tamil"], ["te", "Telugu"], ["ne", "Nepali"], ["si", "Sinhala"],
  ["zh", "Mandarin Chinese"], ["yue", "Cantonese"], ["ja", "Japanese"], ["ko", "Korean"], ["vi", "Vietnamese"], ["th", "Thai"], ["id", "Indonesian"], ["ms", "Malay"], ["tl", "Filipino / Tagalog"],
  ["sw", "Swahili"], ["so", "Somali"], ["am", "Amharic"], ["yo", "Yoruba"], ["ig", "Igbo"], ["ha", "Hausa"], ["af", "Afrikaans"], ["zu", "Zulu"],
].map(([code, label]) => ({ code, label, type: "SPOKEN" }));

export const signedLanguageOptions: LanguageOption[] = [
  { code: "bfi", label: "British Sign Language (BSL)", type: "SIGNED" },
  { code: "ase", label: "American Sign Language (ASL)", type: "SIGNED" },
];

export const otherLanguageOption: LanguageOption = { code: "other", label: "Other", type: "OTHER" };

export const supportedLanguageOptions = [...languageOptions, ...signedLanguageOptions, otherLanguageOption];
