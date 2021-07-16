import {ApiPromise} from '@polkadot/api';
import useApiQuery from 'src/api/hooks/useApiQuery';

export function useReferendums() {
  return useApiQuery('referendums', (api: ApiPromise) => api.derive.democracy.referendums());
}
