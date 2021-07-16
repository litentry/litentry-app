import React from 'react';
import {StyleSheet} from 'react-native';
import {Hash} from '@polkadot/types/interfaces';
import {Text} from '@ui-kitten/components';

import {useTipReason} from 'src/api/hooks/useTipReason';
import {monofontFamily, standardPadding} from 'src/styles';

const styles = StyleSheet.create({
  tipReasonText: {
    fontSize: 12,
    color: '#99a7a3',
    fontFamily: monofontFamily,
    paddingVertical: standardPadding,
    textAlign: 'justify',
  },
});

type Props = {
  reasonHash: Hash;
};

function TipReason({reasonHash}: Props) {
  const reasonText = useTipReason(reasonHash);

  return <Text style={styles.tipReasonText}>{reasonText}</Text>;
}

export default TipReason;
