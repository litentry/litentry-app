import {ApiPromise} from '@polkadot/api';
import {BN, BN_TEN} from '@polkadot/util';

/**
 * turns a string to a Balance BN in order to send through API or
 * show the formatted version to user
 * @param api
 * @param input String (user input E.g. 2.33 or 20 or 0.33)
 * @returns BN
 */
export function getBalanceFromString(api: ApiPromise, input: string): BN {
  const chainDecimal = api.registry.chainDecimals[0] ?? 10;
  const currencyPower = new BN(chainDecimal);

  const isDecimalValue = input.match(/^(\d+)\.(\d+)$/);
  if (isDecimalValue) {
    const integerPart = new BN(input.replace(/\.\d*$/, ''));
    const fractionalPartString = input.replace(/^\d+\./, '').substr(0, chainDecimal);
    const fractionalPart = new BN(fractionalPartString);

    return integerPart
      .mul(BN_TEN.pow(currencyPower))
      .add(fractionalPart.mul(BN_TEN.pow(new BN(chainDecimal - fractionalPartString.length))));
  }

  return new BN(input.replace(/[^\d]/g, '')).mul(BN_TEN.pow(currencyPower));
}
