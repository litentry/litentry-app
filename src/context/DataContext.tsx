import React, {createContext, useContext} from 'react';
import {DataContextValueType, AsyncStorageKeyType} from 'src/types';
import AsyncStorage from '@react-native-community/async-storage';

export const DataContext = createContext<DataContextValueType>({
  asyncStorage: {
    get: () => Promise.resolve(undefined as any),
    set: () => Promise.resolve(),
  },
});

export const useDataContext = () => useContext(DataContext);

type PropTypes = {
  children: React.ReactNode;
};

export default function DataContextProvider({children}: PropTypes) {
  async function get<T>(key: AsyncStorageKeyType, defaultValue: T) {
    const cache = await AsyncStorage.getItem(key);

    if (cache !== null) {
      return JSON.parse(cache);
    }

    return defaultValue;
  }

  async function set(key: AsyncStorageKeyType, value: string) {
    return AsyncStorage.setItem(key, value);
  }

  const asyncStorage = {get, set};

  return <DataContext.Provider value={{asyncStorage}}>{children}</DataContext.Provider>;
}