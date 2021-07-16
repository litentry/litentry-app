import {useContext, useMemo} from 'react';
import {ChainApiContext} from 'context/ChainApiContext';
import {Registry} from '@polkadot/types/types';
import {Compact} from '@polkadot/types';
import {formatBalance} from '@polkadot/util';
import type BN from 'bn.js';

/**
 * Everything here is a loose copy of
 * https://github.com/polkadot-js/apps/blob/bd78840d2142df121d182e8700b20308880dde0a/packages/react-query/src/FormatBalance.tsx
 */

export function useFormatBalance() {
  const {api} = useContext(ChainApiContext);
  const formatInfo = useMemo(() => (api ? getFormat(api.registry) : undefined), [api]);

  return (value: Compact<any> | BN | string) => {
    if (!formatInfo) {
      return undefined;
    }

    return format(value, formatInfo);
  };
}

function getFormat(registry: Registry): [number, string] {
  const decimals = registry.chainDecimals;
  const tokens = registry.chainTokens;

  return [decimals[0] ?? 0, tokens[0] ?? ''];
}

// for million, 2 * 3-grouping + comma
const M_LENGTH = 6 + 1;

function format(value: Compact<any> | BN | string, [decimals, token]: [number, string]): string {
  const [prefix = '', postfix = ''] = formatBalance(value, {decimals, forceUnit: '-', withSi: false}).split('.');
  const unitPost = token;

  if (prefix.length > M_LENGTH) {
    const [major, rest] = formatBalance(value, {decimals, withUnit: false}).split('.');
    const minor = rest?.substr(0, 4);
    const unit = rest?.substr(4);

    return `${major}.${minor} ${unit} ${unit ? unitPost : ' ' + unitPost}`;
  }

  return formatDisplay(prefix, postfix, unitPost);
}

function formatDisplay(prefix: string, postfix: string, unit: string, label = '', isShort = false): string {
  return `${prefix}${isShort ? '' : '.'}${!isShort ? ('0000' + postfix).slice(-4) : ''} ${unit} ${label}`;
}
