import {ApiPromise} from '@polkadot/api';
import {AccountId} from '@polkadot/types/interfaces';
import useApiQuery from 'src/api/hooks/useApiQuery';
import {getAccountsIdentityInfo} from 'src/api/queryFunctions/getAccountsIdentityInfo';

function useAccountsIdentityInfo(accountIds: AccountId[] | string[] | Uint8Array[]) {
  return useApiQuery(['accounts_detail', accountIds], (api: ApiPromise) => {
    return getAccountsIdentityInfo(api, accountIds);
  });
}

export default useAccountsIdentityInfo;
