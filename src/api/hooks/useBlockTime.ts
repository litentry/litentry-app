// Copyright 2017-2020 @polkadot/app-democracy authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import {useMemo, useContext} from 'react';
import {extractTime} from '@polkadot/util';
import {ChainApiContext} from 'context/ChainApiContext';
import {BlockNumber} from '@polkadot/types/interfaces';

type Result = {blockTime: number; timeStringParts: string[]};

const DEFAULT_TIME = new BN(6000);

export function useBlockTime(blocks?: BlockNumber | BN): Result {
  const {api} = useContext(ChainApiContext);

  return useMemo((): Result => {
    if (!api || !blocks) {
      return {blockTime: DEFAULT_TIME.toNumber(), timeStringParts: []};
    }

    const blockTime =
      api.consts.babe?.expectedBlockTime ||
      api.consts.difficulty?.targetBlockTime ||
      api.consts.timestamp?.minimumPeriod.muln(2) ||
      DEFAULT_TIME;
    const {days, hours, minutes, seconds} = extractTime(blockTime.mul(blocks).toNumber());
    const timeStr = [
      days ? (days > 1 ? `${days} days` : '1 day') : null,
      hours ? (hours > 1 ? `${hours} hrs` : '1 hr') : null,
      minutes ? (minutes > 1 ? `${minutes} mins` : '1 min') : null,
      seconds ? (seconds > 1 ? `${seconds} s` : '1 s') : null,
    ].filter((value): value is string => !!value);

    return {blockTime: blockTime.toNumber(), timeStringParts: timeStr};
  }, [api, blocks]);
}
