import { ShoppingItem, VoiceCommand } from '../types';

// Static price list for products
const PRICE_LIST: Record<string, number> = {
  apple: 120,
  banana: 60,
  milk: 55,
  bread: 45,
  rice: 80,
  sugar: 50,
  oil: 150,
  egg: 6,
};

export function applyVoiceCommand(
  list: ShoppingItem[],
  command: VoiceCommand
): { list: ShoppingItem[]; message?: string } {
  if (!command || !command.action) return { list, message: 'No command' };

  let action = command.action.toLowerCase();
  if (action === 'update') action = 'modify';
  if (action === 'find') action = 'search';

  const itemRaw = command.item ? command.item.trim().toLowerCase() : '';
  const itemName = itemRaw
    ? itemRaw.charAt(0).toUpperCase() + itemRaw.slice(1)
    : '';
  const qty = command.quantity ?? null;

  let newList = list.slice();

  // Handle "add" action
  if (action === 'add') {
    const idx = newList.findIndex((i) => i.name.toLowerCase() === itemRaw);
    const addQty = qty ?? 1;
    if (idx >= 0) {
      newList[idx] = {
        ...newList[idx],
        quantity: (newList[idx].quantity || 0) + addQty,
      };
      return {
        list: newList,
        message: `Increased ${newList[idx].name} by ${addQty}`,
      };
    } else {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: itemName,
        quantity: addQty,
        category: 'other',
        dateAdded: new Date(),
        completed: false,
      } as any;
      newList.push(newItem);
      return { list: newList, message: `Added ${newItem.name}` };
    }
  }

  // Handle "remove" action
  if (action === 'remove') {
    if (!itemRaw) return { list, message: 'No item to remove' };
    const idx = newList.findIndex((i) => i.name.toLowerCase() === itemRaw);
    if (idx < 0) return { list, message: `Item ${itemName} not found` };
    if (qty === null || qty === undefined) {
      const removed = newList.splice(idx, 1);
      return { list: newList, message: `Removed ${removed[0].name}` };
    } else {
      const newQ = (newList[idx].quantity || 0) - qty;
      if (newQ > 0) {
        newList[idx] = { ...newList[idx], quantity: newQ };
        return {
          list: newList,
          message: `Decreased ${newList[idx].name} by ${qty}`,
        };
      } else {
        const removed = newList.splice(idx, 1);
        return { list: newList, message: `Removed ${removed[0].name}` };
      }
    }
  }

  // Handle "modify" action
  if (action === 'modify') {
    if (!itemRaw) return { list, message: 'No item to modify' };
    const idx = newList.findIndex((i) => i.name.toLowerCase() === itemRaw);
    if (idx < 0) return { list, message: `Item ${itemName} not found` };
    if (qty === null || qty === undefined)
      return { list, message: 'No quantity provided' };
    newList[idx] = { ...newList[idx], quantity: qty };
    return {
      list: newList,
      message: `Set ${newList[idx].name} quantity to ${qty}`,
    };
  }

  // Handle "clear" action
  if (action === 'clear') {
    return { list: [], searchResults: [], message: 'Cleared list' };
  }

  // Handle "complete" action
  if (action === 'complete') {
    if (!itemRaw) return { list, message: 'No item to complete' };
    const idx = newList.findIndex((i) => i.name.toLowerCase() === itemRaw);
    if (idx < 0) return { list, message: `Item ${itemName} not found` };
    newList[idx] = { ...newList[idx], completed: true };
    return { list: newList, message: `Marked ${newList[idx].name} as complete` };
  }

  // Handle "search" / "find" action
  if (action === 'search') {
    if (!itemRaw) {
      return { list, message: 'Please specify an item to search' };
    }
    const lowerCaseItem = itemRaw.toLowerCase();
    if (PRICE_LIST[lowerCaseItem]) {
      return {
        list,
        message: `${itemName} is available for ₹${PRICE_LIST[lowerCaseItem]}`,
      };
    } else {
      return { list, message: `${itemName} not found in price list` };
    }
  }

  // Handle "price" action
  if (action === 'price') {
    const priceVal = command.filters?.price;
    if (!priceVal) return { list, message: 'No price provided' };
    const filtered = Object.entries(PRICE_LIST)
      .filter(([_, p]) => p <= priceVal)
      .map(([name, p]) => `${name.charAt(0).toUpperCase() + name.slice(1)} (₹${p})`)
      .join(', ');
    return {
      list,
      message: filtered
        ? `Items under ₹${priceVal}: ${filtered}`
        : `No items under ₹${priceVal}`,
    };
  }

  return { list, message: 'Unsupported action' };
}
