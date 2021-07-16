import {ApiPromise} from '@polkadot/api';
import type {Option} from '@polkadot/types';
import type {OpenTip, OpenTipTo225} from '@polkadot/types/interfaces';
import useApiQuery from 'src/api/hooks/useApiQuery';

export type Tip = [string, OpenTip | OpenTipTo225];

function extractTips(tipsWithHashes?: [string[], Option<OpenTip>[]], inHashes?: string[] | null): Tip[] | undefined {
  if (!tipsWithHashes || !inHashes) {
    return undefined;
  }

  const [hashes, optTips] = tipsWithHashes;

  return optTips
    ?.map((opt, index): [string, OpenTip | null] => [hashes[index]!, opt.unwrapOr(null)])
    .filter((val): val is [string, OpenTip] => inHashes.includes(val[0]) && !!val[1])
    .sort((a, b) =>
      a[1].closes.isNone
        ? b[1].closes.isNone
          ? 0
          : -1
        : b[1].closes.isSome
        ? b[1].closes.unwrap().cmp(a[1].closes.unwrap())
        : 1,
    );
}

export function useTips() {
  return useApiQuery('tips', async (api: ApiPromise) => {
    const hashes = await api.query.tips.tips.keys().then((keys) => keys.map((key) => key.args[0].toHex()));

    if (hashes.length) {
      const tips: Option<OpenTip>[] = await api.query.tips.tips.multi(hashes);
      return extractTips([hashes, tips], hashes);
    }
  });
}
