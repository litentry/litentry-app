import React, {useMemo} from 'react';
import {StyleSheet, View, FlatList} from 'react-native';
import {formatBalance} from '@polkadot/util';
import {Text, Divider} from '@ui-kitten/components';
import {useRegistrars} from 'src/api/hooks/useRegistrars';
import globalStyles, {standardPadding, monofontFamily} from 'src/styles';
import StatInfoBlock from 'presentational/StatInfoBlock';
import Padder from 'presentational/Padder';
import RegistrarTeaser from './RegistrarTeaser';

function RegistrarList() {
  const registrars = useRegistrars();
  const registrarsCount = registrars.length;

  const sortedRegistrars = useMemo(
    () => [...registrars].sort((a, b) => (a.fee.toNumber() > b.fee.toNumber() ? 1 : -1)),
    [registrars],
  );

  if (registrarsCount === 0) {
    return (
      <View style={globalStyles.centeredContainer}>
        <Text>No Registrar available.</Text>
      </View>
    );
  }

  const lowestFee = formatBalance(sortedRegistrars[0]?.fee);
  const highestFee = formatBalance(sortedRegistrars[sortedRegistrars.length - 1]?.fee);

  return (
    <View style={globalStyles.paddedContainer}>
      <View style={styles.card}>
        <View style={globalStyles.spaceBetweenRowContainer}>
          <StatInfoBlock title="Count">
            <Text style={styles.number}>{String(registrarsCount)}</Text>
          </StatInfoBlock>
          <StatInfoBlock title="Lowest Fee">{lowestFee}</StatInfoBlock>
          <StatInfoBlock title="Highest Fee">{highestFee}</StatInfoBlock>
        </View>
      </View>

      <Padder scale={1} />
      <Divider />
      <View style={styles.registrarList}>
        <FlatList
          data={registrars}
          renderItem={({item: registrar}) => {
            return (
              <View style={styles.registrarTeaserContainer}>
                <RegistrarTeaser
                  key={registrar.account.toString()}
                  address={registrar.account.toString()}
                  fee={registrar.fee}
                  index={registrar.index}
                />
              </View>
            );
          }}
          keyExtractor={(item) => item.account.toString()}
          ItemSeparatorComponent={Divider}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {paddingVertical: standardPadding * 2},
  number: {
    fontSize: 20,
    fontFamily: monofontFamily,
    paddingVertical: standardPadding,
  },
  registrarList: {paddingVertical: standardPadding * 2},
  registrarTeaserContainer: {
    height: 50,
    justifyContent: 'center',
  },
});

export default RegistrarList;
