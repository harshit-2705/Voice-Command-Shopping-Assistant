
// utils/translator.ts
// Lightweight local translator: Hindi -> English (rule-based).
// Not perfect, but enough for common shopping phrases.

const HI_NUM_WORDS: Record<string, string> = {
  'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4', 'पांच': '5', 'पाँच': '5',
  'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9', 'दस': '10'
};

const HI_WORD_MAP: Record<string, string> = {
  // actions
  'जोड़ो': 'add', 'डालो': 'add', 'शामिल': 'add', 'खरीदो': 'buy', 'लो': 'get',
  'हटाओ': 'remove', 'निकालो': 'remove', 'हटा': 'remove',
  'बदल': 'modify', 'बदलो': 'modify', 'अपडेट': 'modify',
  'खोजो': 'search', 'ढूंढो': 'search',
  'सूची': 'list', 'साफ': 'clear',

  // common items
  'दूध': 'milk', 'सेब': 'apples', 'केले': 'bananas', 'केला': 'banana',
  'पानी': 'water', 'रोटी': 'bread', 'अंडे': 'eggs', 'टमाटर': 'tomatoes',
  'तेल': 'oil', 'चीनी': 'sugar', 'चावल': 'rice'
};

const DEVANAGARI_RE = /[\u0900-\u097F]/;

export function isHindi(text: string): boolean {
  return DEVANAGARI_RE.test(text);
}

export function translateToEnglish(input: string): string {
  if (!input) return '';
  let out = input;

  // Replace Hindi numerals (Devanagari digits) with ASCII digits
  const devanagariDigits = '०१२३४५६७८९';
  for (let i = 0; i < devanagariDigits.length; i++) {
    const d = devanagariDigits[i];
    out = out.replace(new RegExp(d, 'g'), String(i));
  }

  // Replace Hindi number words
  for (const [hi, en] of Object.entries(HI_NUM_WORDS)) {
    out = out.replace(new RegExp(hi, 'g'), en);
  }

  // Word-level replacements
  // Split by spaces and punctuation, rebuild
  out = out.split(/(\s+|,|\.|!|\?|\-|\+|\/)/).map(tok => {
    if (HI_WORD_MAP[tok]) return HI_WORD_MAP[tok];
    return tok;
  }).join('');

  return out;
}
