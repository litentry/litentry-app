import {Text} from '@ui-kitten/components';
import React from 'react';
import {useState} from 'react';
import {StyleSheet, View} from 'react-native';

interface Props {
  percentage: number;
  requiredAmount: number;
}

export function ProgressBar(props: Props) {
  const [barW, setBarW] = useState<number>();
  const [requiredTextW, setRequiredTextW] = useState<number>();

  const {percentage, requiredAmount} = props;

  const left = barW && requiredTextW ? (requiredAmount * barW) / 100 - requiredTextW / 2 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.barBG} onLayout={(e) => setBarW(e.nativeEvent.layout.width)}>
        <View style={[styles.progressed, {width: `${percentage}%`}]} />
      </View>
      <View style={[styles.requiredContainer, {left}]} onLayout={(e) => setRequiredTextW(e.nativeEvent.layout.width)}>
        <Text status="primary">{`${requiredAmount}% required`}</Text>
        <View style={styles.requiredLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginHorizontal: 30, paddingTop: 23},
  barBG: {
    height: 10,
    backgroundColor: 'gray',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressed: {
    backgroundColor: 'green',
    height: '100%',
    borderRightColor: 'white',
    borderRightWidth: 2,
  },
  requiredContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  requiredLine: {
    height: 20,
    width: 3,
    borderRadius: 10,
    backgroundColor: 'blue',
  },
});
