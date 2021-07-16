import {useState, useEffect} from 'react';
import {ApiPromise} from '@polkadot/api';
import {u8aToString} from '@polkadot/util';
import {SupportedNetworkType, AddressDetailType} from 'src/types';
import {createLogger} from 'src/utils';
const logger = createLogger('useAccountDetail');

function useAccountDetail(network?: SupportedNetworkType | null, address?: string, api?: ApiPromise) {
  const [display, setDisplay] = useState(address || '');
  const [inProgress, setInProgress] = useState(true);
  const [identityAddress, setIdentityAddress] = useState(address || '');
  const [detail, setDetail] = useState<AddressDetailType>();
  const [subAccountDisplay, setSubAccountDisplay] = useState('');

  useEffect(() => {
    let localUnsub: () => void | null;

    if (
      api &&
      identityAddress &&
      (network === 'polkadot' || //TODO: this looks shit
        network === 'kusama' ||
        network === 'litentry_test')
    ) {
      api?.query.identity
        ?.identityOf(identityAddress, (registration) => {
          const accountDetail = registration.unwrapOr(undefined);

          if (accountDetail) {
            const {info} = accountDetail;
            const displayName = u8aToString(info.display.asRaw) || identityAddress;
            setDisplay(displayName);
            setDetail({network, data: registration.unwrapOr(undefined)});
            setInProgress(false);
          } else {
            api.query.identity.superOf(identityAddress).then((superRegistration) => {
              const superAccount = superRegistration.unwrapOr(undefined);

              if (superAccount) {
                const [superAccountAddress, displayData] = superAccount;
                setIdentityAddress(superAccountAddress.toString());
                setSubAccountDisplay(u8aToString(displayData.asRaw));
              }
              setInProgress(false);
            });
          }
        })
        .then((unsub) => {
          logger.debug(`useAccountDetail unsub ${unsub}`);
          localUnsub = unsub;
        });
    }
    return () => {
      console.log('unsub is called');
      setInProgress(false);
      localUnsub && localUnsub();
    };
  }, [api, identityAddress, network, address]);

  const displayFull = subAccountDisplay ? `${display}/${subAccountDisplay}` : display;

  return {
    display: displayFull,
    inProgress,
    isNaked: displayFull === identityAddress,
    detail,
  };
}

export default useAccountDetail;
