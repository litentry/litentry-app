import {ApiPromise} from '@polkadot/api';
import useApiQuery from 'src/api/hooks/useApiQuery';
import {useAccounts} from 'context/AccountsContext';
import {getAccountsIdentityInfo} from 'src/api/queryFunctions/getAccountsIdentityInfo';

export function useCouncilMembers() {
  const {accounts} = useAccounts();

  return useApiQuery(['council-members', accounts], async (api: ApiPromise) => {
    const accountIds = await api.query.council.members();
    const members = await getAccountsIdentityInfo(api, accountIds);

    return {
      members,
      isMember: members.some((member) =>
        accounts.find((account) => account.address.toString() === member.accountId.toString()),
      ),
    };
  });
}
