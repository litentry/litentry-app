/**
 * referenced from
 * https://github.com/polkadot-js/apps/tree/master/packages/react-params/src/Param
 */

import {Codec, IExtrinsic, IMethod, TypeDef} from '@polkadot/types/types';
import {Account} from 'src/layout/Account';
import {StyleSheet, View} from 'react-native';
import {Text} from '@ui-kitten/components';
import Identicon from '@polkadot/reactnative-identicon';
import Padder from 'presentational/Padder';
import {isU8a, u8aToString} from '@polkadot/util';
import {Balance, Call, FunctionMetadataLatest, ProposalIndex} from '@polkadot/types/interfaces';
import React, {useContext} from 'react';
import {standardPadding} from 'src/styles';
import {useFormatBalance} from 'src/api/hooks/useFormatBalance';
import {ChainApiContext} from 'context/ChainApiContext';
import {Compact, GenericCall, getTypeDef} from '@polkadot/types';
import {useQuery} from 'react-query';

export function CallInspector({call}: {call: Call}) {
  const formatBalance = useFormatBalance();
  const data = useParams(call);

  return (
    <View>
      {data.map((p, key) => {
        return (
          <View style={styles.paramRow} key={key}>
            {(() => {
              if (p.type.type === 'AccountId' && p.value) {
                return (
                  <Account id={p.value.toString()} key={key}>
                    {({info, accountId}) => {
                      return (
                        <>
                          <Text>{p.name}: </Text>
                          <Identicon value={accountId} size={20} />
                          <Padder scale={0.3} />
                          <Text numberOfLines={1} category={'c1'} style={{flex: 1}}>
                            {info ? u8aToString(info.display.asRaw) : accountId.toString()}
                          </Text>
                        </>
                      );
                    }}
                  </Account>
                );
              }

              if (p.type.type === 'Bytes' && p.value && isU8a(p.value)) {
                return <Text>{`${p.name}: ${u8aToString(p.value)}`}</Text>;
              }

              if (p.type.type === 'Balance' && p.value) {
                return (
                  <>
                    <Text>{p.name}: </Text>
                    <Text>{formatBalance(p.value as Balance)}</Text>
                  </>
                );
              }

              return <Text>{`${p.name}: ${p.value}`}</Text>;
            })()}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  paramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: standardPadding,
    paddingVertical: standardPadding / 3,
  },
});
const METHOD_TREA = ['approveProposal', 'rejectProposal'];

export interface Param {
  name: string;
  type: TypeDef;
  value?: Codec;
}

export function useParams(proposal: Call): Param[] {
  const {api} = useContext(ChainApiContext);
  const {method, section} = proposal.registry.findMetaCall(proposal.callIndex);
  const isTreasury = section === 'treasury' && METHOD_TREA.includes(method);
  const proposalId = isTreasury ? (proposal.args[0] as Compact<ProposalIndex>).unwrap() : undefined;
  const {data: treasuryProposal} = useQuery(
    ['proposal', proposalId?.toString()],
    () => (proposalId ? api?.query.treasury.proposals(proposalId).then((p) => p.unwrapOr(undefined)) : undefined),
    {
      enabled: !!proposalId,
    },
  );
  const extractedParams = extractParams(proposal);
  if (treasuryProposal) {
    extractedParams.push({type: getTypeDef('AccountId'), value: treasuryProposal.beneficiary, name: 'beneficiary'});
    extractedParams.push({type: getTypeDef('AccountId'), value: treasuryProposal.proposer, name: 'proposer'});
    extractedParams.push({type: getTypeDef('Balance'), value: treasuryProposal.value, name: 'payout'});
  }
  return extractedParams;
}

function extractParams(value: IExtrinsic | IMethod): Param[] {
  return GenericCall.filterOrigin(value.meta).map(
    ({name, type}, k): Param => ({
      name: name.toString(),
      type: getTypeDef(type.toString()),
      value: value.args[k],
    }),
  );
}

/**
 * functions bellow help extract useful data
 * from each motion object. they are mostly loosely copied from
 * https://github.com/polkadot-js/apps/blob/master/packages/react-components/src/Call.tsx
 */

export function formatCallMeta(meta?: FunctionMetadataLatest): string {
  if (!meta || !meta.documentation.length) {
    return '';
  }

  const strings = meta.documentation.map((doc) => doc.toString().trim());
  const firstEmpty = strings.findIndex((doc) => !doc.length);
  const combined = (firstEmpty === -1 ? strings : strings.slice(0, firstEmpty))
    .join(' ')
    .replace(/#(<weight>| <weight>).*<\/weight>/, '');
  const parts = splitParts(combined.replace(/\\/g, '').replace(/`/g, ''));

  return parts.join(' ');
}

function splitSingle(value: string[], sep: string): string[] {
  return value.reduce((result: string[], value: string): string[] => {
    return value.split(sep).reduce((result: string[], value: string) => result.concat(value), result);
  }, []);
}

function splitParts(value: string): string[] {
  return ['[', ']'].reduce((result: string[], sep) => splitSingle(result, sep), [value]);
}
