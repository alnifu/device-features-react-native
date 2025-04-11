import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelEntry } from '../types';

const STORAGE_KEY = 'TRAVEL_ENTRIES';

export const saveEntry = async (entry: TravelEntry) => {
  try {
    const entries = await getEntries();
    entries.push(entry);  
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving entry:', error);
  }
};

export const getEntries = async (): Promise<TravelEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : []; 
  } catch (error) {
    console.error('Error retrieving entries:', error);
    return []; 
  }
};

export const deleteEntry = async (id: string) => {
  try {
    const entries = await getEntries();
    const filtered = entries.filter(entry => entry.id !== id); 
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered)); 
  } catch (error) {
    console.error('Error deleting entry:', error);
  }
};
