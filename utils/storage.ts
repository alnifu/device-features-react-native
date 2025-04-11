// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelEntry } from '../types';

const STORAGE_KEY = 'TRAVEL_ENTRIES';

// Save a new entry
export const saveEntry = async (entry: TravelEntry) => {
  try {
    const entries = await getEntries();
    entries.push(entry);  // Add new entry to the array
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entry:', error);
  }
};

// Get all entries
export const getEntries = async (): Promise<TravelEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : []; // Return empty array if no data is found
  } catch (error) {
    console.error('Error retrieving entries:', error);
    return [];  // Return empty array if there's an error
  }
};

// Delete an entry by ID
export const deleteEntry = async (id: string) => {
  try {
    const entries = await getEntries();
    const filtered = entries.filter(entry => entry.id !== id); // Remove entry by ID
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered)); // Save updated list
  } catch (error) {
    console.error('Error deleting entry:', error);
  }
};
