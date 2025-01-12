export const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const savedValue = localStorage.getItem(key);
    if (savedValue === null || savedValue === '') {
      console.log(`No saved value found for key: ${key}`);
      return defaultValue;
    }
    
    // Use a custom parse function that can handle URL objects
    const parsedValue = JSON.parse(savedValue, (k, v) => {
      if (k === 'url' && typeof v === 'string') {
        try {
          return new URL(v).toString();
        } catch (error) {
          console.warn(`Invalid URL found in localStorage for key ${key}: ${v}`);
          return null;
        }
      }
      return v;
    });
    
    if (typeof parsedValue !== typeof defaultValue) {
      console.warn(`Type mismatch for key ${key}. Expected ${typeof defaultValue}, got ${typeof parsedValue}`);
      return defaultValue;
    }
    
    return parsedValue as T;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const saveToLocalStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    // Use a custom stringify function that can handle URL objects
    const serializedValue = JSON.stringify(value, (k, v) => {
      if (v instanceof URL) {
        return v.toString();
      }
      return v;
    });
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

