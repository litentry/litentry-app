import {AccountId, Registration} from '@polkadot/types/interfaces';
import {IdentityInfo} from '@polkadot/types/interfaces/identity/types';
import {useAccountIdentity} from 'src/hook/useAccountIdentity';

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
  const {data: account} = useAccountIdentity(id);

  if (!account) {
    return children({accountId: id});
  }

  return children(account);
}
