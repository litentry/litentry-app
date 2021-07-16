import React from 'react';
import Identicon from '@polkadot/reactnative-identicon';
import {StyleSheet, View} from 'react-native';
import {ListItem, Text} from '@ui-kitten/components';
import {useNavigation} from '@react-navigation/native';
import {Tip} from 'src/api/hooks/useTips';
import {tipDetailScreen} from 'src/navigation/routeKeys';
import TipReason from 'layout/tips/TipReason';
import {Account} from 'src/layout/Account';
import AccountInfoInlineTeaser from 'presentational/AccountInfoInlineTeaser';
import {u8aToString} from '@polkadot/util';

const styles = StyleSheet.create({
  identIconContainer: {
    marginRight: 15,
  },
});

type TipTeaserProps = {
  tip: Tip;
};

function TipTeaser({tip}: TipTeaserProps) {
  const navigation = useNavigation();
  const {who, reason} = tip[1];
  const tipHash = tip[0];

  return (
    <ListItem
      title={() => (
        <Account id={who.toString()}>
          {({info, registration, accountId}) => {
            const display = u8aToString(info?.display.asRaw);
            return display ? (
              <AccountInfoInlineTeaser display={display} judgements={registration?.judgements} />
            ) : (
              <Text numberOfLines={1} ellipsizeMode="middle" category={'c2'}>
                {String(accountId)}
              </Text>
            );
          }}
        </Account>
      )}
      description={() => <TipReason reasonHash={reason} />}
      accessoryLeft={() => (
        <View style={styles.identIconContainer}>
          <Identicon value={who} size={40} />
        </View>
      )}
      onPress={() => navigation.navigate(tipDetailScreen, {hash: tipHash})}
    />
  );
}

export default TipTeaser;
