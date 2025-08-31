
// utils/sqlEngine.ts
import { ShoppingItem, VoiceCommand } from '../types';

export type SQLOp = 'INSERT' | 'DELETE' | 'UPDATE' | 'SELECT' | 'CLEAR';

export function toSQL(cmd: VoiceCommand): string {
  const item = cmd.item?.toLowerCase() ?? '';
  const qty = cmd.quantity ?? 1;

  switch (cmd.action) {
    case 'add':
      return `INSERT INTO shopping_list (name, quantity) VALUES ('${item}', ${qty});`;
    case 'remove':
      return `DELETE FROM shopping_list WHERE name = '${item}';`;
    case 'modify':
      return `UPDATE shopping_list SET quantity = ${qty} WHERE name = '${item}';`;
    case 'search':
      return `SELECT * FROM products WHERE name LIKE '%${item}%';`;
    case 'clear':
      return `DELETE FROM shopping_list;`;
    case 'complete':
      return `UPDATE shopping_list SET completed = 1 WHERE name = '${item}';`;
    default:
      return '';
  }
}

export function executeSQL(sql: string, list: ShoppingItem[]): { list: ShoppingItem[], result?: any } {
  if (!sql) return { list };
  const s = sql.trim().toUpperCase();

  // CLEAR all
  if (s.startsWith('DELETE FROM SHOPPING_LIST;')) {
    return { list: [] };
  }

  // INSERT
  if (s.startsWith('INSERT INTO SHOPPING_LIST')) {
    const m = sql.match(/VALUES\s*\('\s*([^']+)\s*'\s*,\s*(\d+(?:\.\d+)?)\s*\)/i);
    if (m) {
      const name = m[1].toLowerCase();
      const qty = Number(m[2]);
      // merge quantity if item exists
      const idx = list.findIndex(i => i.name.toLowerCase() === name);
      if (idx >= 0) {
        const copy = list.slice();
        copy[idx] = { ...copy[idx], quantity: (copy[idx].quantity || 0) + qty };
        return { list: copy };
      }
      const newItem: ShoppingItem = {
        id: cryptoRandom(),
        name,
        quantity: qty,
        unit: undefined,
        category: autoCategory(name),
        dateAdded: new Date(),
        completed: false
      };
      return { list: [...list, newItem] };
    }
  }

  // DELETE specific
  if (s.startsWith('DELETE FROM SHOPPING_LIST WHERE NAME=')) {
    const m = sql.match(/WHERE\s+NAME\s*=\s*'\s*([^']+)\s*'\s*;?/i);
    if (m) {
      const name = m[1].toLowerCase();
      return { list: list.filter(i => i.name.toLowerCase() != name) };
    }
  }

  // UPDATE quantity
  if (s.startsWith('UPDATE SHOPPING_LIST SET QUANTITY')) {
    const m = sql.match(/SET\s+QUANTITY\s*=\s*(\d+(?:\.\d+)?)\s+WHERE\s+NAME\s*=\s*'\s*([^']+)\s*'\s*;?/i);
    if (m) {
      const qty = Number(m[1]);
      const name = m[2].toLowerCase();
      const copy = list.map(i => i.name.toLowerCase() === name ? { ...i, quantity: qty } : i);
      return { list: copy };
    }
  }

  // COMPLETE mark
  if (s.startsWith('UPDATE SHOPPING_LIST SET COMPLETED')) {
    const m = sql.match(/WHERE\s+NAME\s*=\s*'\s*([^']+)\s*'\s*;?/i);
    if (m) {
      const name = m[1].toLowerCase();
      const copy = list.map(i => i.name.toLowerCase() === name ? { ...i, completed: true } : i);
      return { list: copy };
    }
  }

  // SELECT products (placeholder returns none here)
  if (s.startsWith('SELECT')) {
    return { list, result: [] };
  }

  return { list };
}

function autoCategory(name: string): string {
  if (/milk|cheese|yogurt|butter/i.test(name)) return 'dairy';
  if (/apple|banana|tomato|onion|potato|orange/i.test(name)) return 'produce';
  if (/bread|rice|flour|pasta/i.test(name)) return 'staples';
  if (/water|juice|soda/i.test(name)) return 'beverages';
  return 'other';
}

function cryptoRandom(): string {
  try {
    // @ts-ignore
    const arr = new Uint32Array(4);
    // @ts-ignore
    (self.crypto || (window as any).crypto).getRandomValues(arr);
    return Array.from(arr).map(n => n.toString(16)).join('');
  } catch {
    return Math.random().toString(36).slice(2);
  }
}
