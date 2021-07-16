import {useContext, useEffect, useState} from 'react';
import {OpenTip} from '@polkadot/types/interfaces';
import {ChainApiContext} from 'context/ChainApiContext';

export function useTip(hash: string) {
  const [tip, setTip] = useState<OpenTip>();
  const {api} = useContext(ChainApiContext);

  useEffect(() => {
    api?.query.tips.tips(hash).then((t) => setTip(t.unwrap()));
  }, [api, hash]);

  return tip;
}
