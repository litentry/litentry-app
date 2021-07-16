import {useContext} from 'react';
import {RegistrarInfo} from '@polkadot/types/interfaces';
import {Option} from '@polkadot/types';
import {BN_ZERO} from '@polkadot/util';
import {ChainApiContext} from 'src/context/ChainApiContext';
import {useCall} from 'src/hook/useCall';

interface RegistrarInfoWithIndex extends RegistrarInfo {
  index: number;
}

export function useRegistrars(): RegistrarInfoWithIndex[] {
  const {api} = useContext(ChainApiContext);
  const registrarsInfo = useCall<Option<RegistrarInfo>[]>(api?.query.identity.registrars);

  return (registrarsInfo || [])
    .map((r) => r.unwrapOr(undefined))
    .filter((r): r is RegistrarInfo => !!r?.fee.gt(BN_ZERO))
    .map((r, index) => Object.assign({}, r, {index}));
}
