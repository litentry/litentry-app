import {useApi} from 'context/ChainApiContext';
import {useQuery} from 'react-query';
import {getAccountsIdentityInfo} from 'src/service/api/account';

export function useAccountIdentity(id?: string) {
  const {api} = useApi();

  return useQuery(
    ['account_identity', id],
    async () => {
      if (!id) {
        return undefined;
      }

      const accounts = api ? await getAccountsIdentityInfo([id], api) : undefined;
      return accounts?.[0];
    },
    {staleTime: 1000 * 60, enabled: !!id},
  );
}
