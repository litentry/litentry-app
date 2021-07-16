import {useContext} from 'react';
import {ChainApiContext} from 'context/ChainApiContext';
import {useQuery} from 'react-query';
import {getAccountsIdentityInfo} from 'service/api/account';
import {useAccounts} from 'context/AccountsContext';

export function useCouncilMembers() {
  const {api} = useContext(ChainApiContext);
  const {accounts} = useAccounts();

  return useQuery(
    ['council-members', {accounts}],
    async () => {
      const accountIds = await api?.query.council.members();

      if (accountIds && api) {
        const members = await getAccountsIdentityInfo(accountIds, api);
        return {
          members,
          isMember: members.some((accountId) => accounts?.find((a) => a.address.toString() === accountId.toString())),
        };
      }
    },
    {staleTime: 0},
  );
}
