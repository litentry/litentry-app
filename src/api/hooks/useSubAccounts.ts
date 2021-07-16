import {ApiPromise} from '@polkadot/api';
import {ITuple} from '@polkadot/types/types';
import {BalanceOf, AccountId} from '@polkadot/types/interfaces';
import {Vec} from '@polkadot/types';
import useApiQuery from 'src/api/hooks/useApiQuery';

type SubAccounts = ITuple<[BalanceOf, Vec<AccountId>]>;

export function useSubAccounts(address?: string) {
  return useApiQuery(
    ['sub_accounts', address],
    (api: ApiPromise): Promise<SubAccounts> => api.query.identity.subsOf(address || ''),
    {enabled: Boolean(address)},
  );
}
