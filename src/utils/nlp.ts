import { VoiceCommand } from '../types';
import { isHindi, translateToEnglish } from './translator';
import { toSQL as _toSQL } from './sqlEngine';

/**
 * Multilingual -> English normalization, then parse -> VoiceCommand.
 * Also exposes toSQL for the "convert to SQL then execute" approach.
 */

const EN_ACTIONS = {
  add: /(\badd\b|\bbuy\b|\bget\b|\bappend\b|\badd to list\b)/i,
  remove: /(\bremove\b|\bdelete\b|\btake off\b)/i,
  modify: /(\bmodify\b|\bchange\b|\bupdate\b|\bset\b)/i,
  search: /(\bsearch\b|\bfind\b|\blook for\b)/i,
  clear: /(\bclear\b|\bempty\b|\bdelete all\b)/i,
  complete: /(\bdone\b|\bcomplete\b|\bcompleted\b|\bpurchased\b|\bgot\b)/i,
  price: /(\bprice\b|\bcost\b|\brate\b|\bhow much\b)/i   // ✅ NEW
};


const EN_NUM: Record<string, number> = {
  one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10
};

const UNIT_RE = /(bottles?|cans?|boxes?|bags?|packs?|pieces?|items?|kg|g|l|ml|pounds?|lbs?)/i;

export function normalizeToEnglish(text: string): string {
  return isHindi(text) ? translateToEnglish(text) : text;
}

export function parseVoiceCommand(input: string): VoiceCommand | null {
  if (!input) return null;
  const english = normalizeToEnglish(input).toLowerCase().trim();

  let action: VoiceCommand['action'] | null = null;
  if (EN_ACTIONS.add.test(english)) action = 'add';
  else if (EN_ACTIONS.remove.test(english)) action = 'remove';
  else if (EN_ACTIONS.modify.test(english)) action = 'modify';
  else if (EN_ACTIONS.search.test(english)) action = 'search';
  else if (EN_ACTIONS.clear.test(english)) action = 'clear';
  else if (EN_ACTIONS.complete.test(english)) action = 'complete';
  else if (EN_ACTIONS.price.test(english)) action = 'price';


  // quantity: number, english word number
  let quantity: number | undefined;
  const num = english.match(/\b(\d+(?:\.\d+)?)\b/);
  if (num) quantity = Number(num[1]);
  else {
    const word = english.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/);
    if (word) quantity = EN_NUM[word[1] as keyof typeof EN_NUM];
  }
  if (!quantity && action === 'add') quantity = 1;

  // strip action & helpers to get item
  let item = english
    .replace(EN_ACTIONS.add, ' ')
    .replace(EN_ACTIONS.remove, ' ')
    .replace(EN_ACTIONS.modify, ' ')
    .replace(EN_ACTIONS.search, ' ')
    .replace(EN_ACTIONS.clear, ' ')
    .replace(EN_ACTIONS.complete, ' ')
    .replace(EN_ACTIONS.price, ' ')   // ✅ strip price words
    .replace(/\b(to|my|the|a|an|of|list|please|with|quantity|set|change|update|for)\b/g, ' ')
    .replace(UNIT_RE, ' ')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, ' ')
    .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/g, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!action) return null;
  if (!item && (action === 'add' || action === 'remove' || action === 'modify' || action === 'complete' || action === 'price')) return null;

  const cmd: VoiceCommand = {
    action,
    item: item || undefined,
    quantity,
    filters: {}
  };
  return cmd;
}



export function toSQL(cmd: VoiceCommand): string {
  return _toSQL(cmd);
}
