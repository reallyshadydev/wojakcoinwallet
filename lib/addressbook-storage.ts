/**
 * Address book storage — localStorage.
 * Stores { label, address } entries for addresses the user sends to.
 */

const STORAGE_KEY = "wojak_addressbook";

export interface AddressBookEntry {
  label: string;
  address: string;
  addedAt?: number;
}

function loadEntries(): AddressBookEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: AddressBookEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getAddressBook(): AddressBookEntry[] {
  return loadEntries();
}

/** Returns true if the address is already in the address book (trimmed comparison). */
export function isInAddressBook(address: string): boolean {
  const trimmed = address.trim();
  return loadEntries().some((e) => e.address === trimmed);
}

/** Returns true if the address was added, false if it already existed (no duplicate saved). */
export function addAddress(label: string, address: string): boolean {
  const entries = loadEntries();
  const trimmed = address.trim();
  if (entries.some((e) => e.address === trimmed)) return false;
  entries.unshift({
    label: label.trim() || trimmed.slice(0, 12) + "...",
    address: trimmed,
    addedAt: Date.now(),
  });
  saveEntries(entries);
  return true;
}

export function removeAddress(address: string): void {
  const entries = loadEntries().filter((e) => e.address !== address);
  saveEntries(entries);
}

export function updateEntry(oldAddress: string, updates: { label?: string }): void {
  const entries = loadEntries();
  const idx = entries.findIndex((e) => e.address === oldAddress);
  if (idx < 0) return;
  if (updates.label !== undefined) entries[idx].label = updates.label.trim() || entries[idx].label;
  saveEntries(entries);
}
