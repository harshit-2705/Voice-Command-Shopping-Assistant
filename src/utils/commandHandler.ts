// utils/commandHandler.ts
import { VoiceCommand, ShoppingItem } from '../types';
import { toSQL, executeSQL } from './sqlEngine';

export function handleCommand(cmd: VoiceCommand, list: ShoppingItem[]): ShoppingItem[] {
  // Convert the structured command into SQL
  const sql = toSQL(cmd);

  // Apply SQL to the in-memory shopping list
  const { list: updatedList } = executeSQL(sql, list);

  return updatedList;
}
