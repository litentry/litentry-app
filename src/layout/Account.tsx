import {AccountId, Registration} from '@polkadot/types/interfaces';
import {IdentityInfo} from '@polkadot/types/interfaces/identity/types';
import {useAccountIdentityInfo} from 'src/api/hooks/useAccountIdentityInfo';

export function Account({
  id,
  children,
}: {
  id: string;
  children: (info: {
    info?: IdentityInfo;
    registration?: Registration;
    accountId: string | AccountId | Uint8Array;
  }) => JSX.Element;
}) {
  const {data: account} = useAccountIdentityInfo(id);

  if (!account) {
    return children({accountId: id});
  }

  return children(account);
}
