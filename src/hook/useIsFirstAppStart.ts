import {useQuery} from 'react-query';
import * as AsyncStorage from 'src/service/AsyncStorage';

// Check if it's the first time the app is launched
export function useIsFirstAppStart() {
  return useQuery('is_first_app_start', async () => AsyncStorage.getItem('is_first_app_start', true), {
    onSuccess: async (data) => {
      if (data) {
        AsyncStorage.setItem('is_first_app_start', false);
      }
    },
  });
}
