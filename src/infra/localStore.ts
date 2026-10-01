// Android e iOS: localStorage persistido em SQLite, conforme o guia do Expo para Supabase.
import 'expo-sqlite/localStorage/install';

export const localStore: Storage | null = globalThis.localStorage ?? null;
