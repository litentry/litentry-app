import {ApiPromise} from '@polkadot/api';
import {Option} from '@polkadot/types';
import {AccountId, Registration} from '@polkadot/types/interfaces';
import {IdentityInfo} from '@polkadot/types/interfaces/identity/types';

type AccountIdentityInfo = {
  accountId: AccountId | Uint8Array | string;
  info?: IdentityInfo;
  registration?: Registration;
};

export async function getAccountsIdentityInfo(api: ApiPromise, accountIds: AccountId[] | string[] | Uint8Array[]) {
  const registrationOptions = await api.query.identity.identityOf.multi<Option<Registration>>(accountIds);
  const accountsInfo: Array<AccountIdentityInfo> = [];

  for (const [index, registrationOption] of registrationOptions.entries()) {
    const registration = registrationOption.unwrapOr(undefined);
    const accountId = accountIds[index];

    if (!accountId) {
      continue;
    }

    if (registration) {
      accountsInfo.push({accountId, info: registration.info, registration});
    } else {
      const superAccountDataOption = await api.query.identity.superOf(accountId);
      const superAccountData = superAccountDataOption.unwrapOr(undefined);

      if (superAccountData) {
        const [superAccountId] = superAccountData;
        const superAccountOption = await api.query.identity.identityOf(superAccountId);
        const superRegistration = superAccountOption.unwrapOr(undefined);

        if (superRegistration) {
          accountsInfo.push({
            accountId: superAccountId,
            info: superRegistration.info,
            registration: superRegistration,
          });
        }
      } else {
        accountsInfo.push({accountId});
      }
    }
  }

  return accountsInfo;
}
