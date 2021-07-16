import {useContext} from 'react';
import {hexToString} from '@polkadot/util';
import {Option, Bytes} from '@polkadot/types';
import {Hash} from '@polkadot/types/interfaces';
import {ChainApiContext} from 'context/ChainApiContext';
import {useCall} from 'src/hook/useCall';

const transformTip = {
  transform: (optBytes: Option<Bytes>) => (optBytes.isSome ? hexToString(optBytes.unwrap().toHex()) : null),
};

export function useTipReason(reasonHash: Hash) {
  const {api} = useContext(ChainApiContext);

  const reasonText = useCall<string | null>(api?.query.tips.reasons, [reasonHash], transformTip);

  return reasonText || reasonHash.toHex();
}
