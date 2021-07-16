import {ApiPromise} from '@polkadot/api';
import useApiQuery from 'src/api/hooks/useApiQuery';

export function useMotions() {
  return useApiQuery('motions', (api: ApiPromise) => api.derive.council.proposals());
}
