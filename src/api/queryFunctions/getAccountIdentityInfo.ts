import {ApiPromise} from '@polkadot/api';

export async function getAccountIdentityInfo(api: ApiPromise, accountId: string) {
  const registrationOption = await api.query.identity.identityOf(accountId);
  const registration = registrationOption.unwrapOr(undefined);

  if (registration) {
    return {accountId, info: registration.info, registration};
  }

  const superAccountDataOption = await api.query.identity.superOf(accountId);
  const superAccountData = superAccountDataOption.unwrapOr(undefined);

  if (superAccountData) {
    const [superAccountId] = superAccountData;
    const superAccountOption = await api.query.identity.identityOf(superAccountId);
    const superRegistration = superAccountOption.unwrapOr(undefined);

    if (superRegistration) {
      return {
        accountId: superAccountId,
        info: superRegistration.info,
        registration: superRegistration,
      };
    }
  } else {
    return {accountId};
  }
}
