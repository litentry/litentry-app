import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Hash} from '@polkadot/types/interfaces';
import {Text} from '@ui-kitten/components';
import {useTipReason} from 'src/hook/useTipReason';

type Props = {
  reasonHash: Hash;
};

function TipReason({reasonHash}: Props) {
  const reasonText = useTipReason(reasonHash);

  return (
    <View style={styles.row}>
      <Text category="c1">Reason: </Text>
      <Text category="c1" style={styles.tipReasonText}>
        {reasonText}
      </Text>
    </View>
  );
}

export default TipReason;

const styles = StyleSheet.create({
  tipReasonText: {
    color: '#99a7a3',
    textAlign: 'justify',
  },
  row: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
