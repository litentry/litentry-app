import React from 'react';
import Identicon from '@polkadot/reactnative-identicon';
import {StyleSheet, View} from 'react-native';
import {Card, ListItem, Text} from '@ui-kitten/components';
import {useNavigation} from '@react-navigation/native';
import {Tip} from 'src/hook/useTips';
import {tipDetailScreen} from 'src/navigation/routeKeys';
import TipReason from 'layout/tips/TipReason';
import {Account} from 'src/layout/Account';
import AccountInfoInlineTeaser from 'presentational/AccountInfoInlineTeaser';
import {u8aToString} from '@polkadot/util';
import globalStyles, {standardPadding} from 'src/styles';
import Padder from 'presentational/Padder';

type TipTeaserProps = {
  tip: Tip;
};

export function TipTeaser({tip}: TipTeaserProps) {
  const navigation = useNavigation();
  const {who, reason} = tip[1];
  const tipHash = tip[0];

  return (
    <Card style={styles.card} onPress={() => navigation.navigate(tipDetailScreen, {hash: tipHash})}>
      <Account id={who.toString()}>
        {({info, accountId}) => (
          <View style={styles.row}>
            <Identicon value={accountId} size={30} />
            <Padder scale={0.3} />
            <Text numberOfLines={1} category={'c1'} ellipsizeMode="middle" style={globalStyles.flex}>
              {info ? u8aToString(info.display.asRaw) : accountId.toString()}
            </Text>
          </View>
        )}
      </Account>
      <TipReason reasonHash={reason} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: standardPadding,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identIconContainer: {
    marginRight: 15,
  },
});
