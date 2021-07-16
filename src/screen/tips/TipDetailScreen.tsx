import React, {useContext, useMemo} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {formatBalance, formatNumber, u8aToString} from '@polkadot/util';
import {BlockNumber, OpenTip} from '@polkadot/types/interfaces';
import Identicon from '@polkadot/reactnative-identicon';
import {Card, Divider, List, ListItem, Text} from '@ui-kitten/components';
import AddressInlineTeaser from 'layout/AddressInlineTeaser';
import {useTip} from 'src/api/hooks/useTip';
import TipReason from 'layout/tips/TipReason';
import globalStyles, {monofontFamily} from 'src/styles';
import {useCall} from 'src/hook/useCall';
import {ChainApiContext} from 'context/ChainApiContext';
import {BlockTime} from 'layout/BlockTime';
import {extractTipState} from 'layout/tips/utils';
import NoDataImage from 'image/no_data.png';
import {Account} from 'src/layout/Account';
import AccountInfoInlineTeaser from 'presentational/AccountInfoInlineTeaser';
import {useAccounts} from 'context/AccountsContext';
import SafeView, {noTopEdges} from 'presentational/SafeView';
import {DashboardStackParamList} from 'src/navigation/navigation';

type ScreenProps = {
  navigation: StackNavigationProp<DashboardStackParamList>;
  route: RouteProp<DashboardStackParamList, 'Tip'>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  whoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionText: {
    fontFamily: monofontFamily,
  },
  addressContainer: {
    flex: 4,
  },
  finderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closesAtContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  containerSpacing: {
    marginTop: 20,
  },
  emptyTippersContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTippersImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
  },
  emptyTippersText: {
    fontFamily: monofontFamily,
    marginBottom: 10,
  },
  tipperIconContainer: {marginRight: 15},
});

type TipDetailContentProps = {
  tip: OpenTip;
  bestNumber: BlockNumber | undefined;
};

function TipDetailContent({tip, bestNumber}: TipDetailContentProps) {
  const {accounts} = useAccounts();
  const tipState = useMemo(() => {
    if (tip) {
      return extractTipState(
        tip,
        accounts.map((a) => a.address),
      );
    }
  }, [tip, accounts]);

  if (!tipState) {
    return null;
  }

  const {closesAt, median} = tipState;
  const tippersCount = tip.tips.length;

  return (
    <>
      <Card>
        <View style={styles.whoContainer}>
          <View style={styles.sectionTextContainer}>
            <Text category="s1" style={styles.sectionText}>
              Who
            </Text>
          </View>
          <View style={styles.addressContainer}>
            <AddressInlineTeaser address={String(tip.who)} />
          </View>
        </View>
        <View style={styles.finderContainer}>
          <View style={styles.sectionTextContainer}>
            <Text category="s1" style={styles.sectionText}>
              Finder
            </Text>
          </View>
          <View style={styles.addressContainer}>
            <AddressInlineTeaser address={String(tip.finder)} />
          </View>
        </View>
      </Card>
      <View style={styles.containerSpacing}>
        <Text category="s1" style={styles.sectionText}>
          Reason
        </Text>
        <TipReason reasonHash={tip.reason} />
      </View>
      {closesAt && bestNumber ? (
        <View style={styles.closesAtContainer}>
          <Text category="s1" style={styles.sectionText}>
            Closes at
          </Text>
          <>
            <BlockTime blockNumber={closesAt.sub(bestNumber)} />
            <Text style={styles.sectionText}>#{formatNumber(closesAt)}</Text>
          </>
        </View>
      ) : null}
      <View style={styles.containerSpacing}>
        <Text category="s1" style={styles.sectionText}>
          Tippers {tippersCount > 0 ? `(${tippersCount})` : ''}
        </Text>
        {Number(median) > 0 ? <Text>{formatBalance(median)}</Text> : null}
      </View>
    </>
  );
}

function EmptyTippers() {
  return (
    <Card style={styles.emptyTippersContainer}>
      <Image source={NoDataImage} style={styles.emptyTippersImage} />
      <Text category="c2" style={styles.emptyTippersText}>
        There are no tippers yet.
      </Text>
    </Card>
  );
}

function TipDetailScreen({route}: ScreenProps) {
  const {api} = useContext(ChainApiContext);
  const hash = route.params?.hash;
  const tip = useTip(hash);
  const bestNumber = useCall<BlockNumber>(api?.derive.chain.bestNumber);

  if (!tip) {
    return null;
  }

  return (
    <SafeView edges={noTopEdges}>
      <List
        ListHeaderComponent={<TipDetailContent tip={tip} bestNumber={bestNumber} />}
        data={tip.tips}
        style={[globalStyles.paddedContainer, styles.container]}
        ItemSeparatorComponent={Divider}
        renderItem={({item}) => {
          const [tipper, balance] = item;
          return (
            <ListItem
              title={() => {
                return (
                  <Account id={tipper.toString()}>
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
                );
              }}
              description={() => {
                return <Text>{formatBalance(balance)}</Text>;
              }}
              accessoryLeft={() => (
                <View style={styles.tipperIconContainer}>
                  <Identicon value={tipper} size={35} />
                </View>
              )}
            />
          );
        }}
        ListEmptyComponent={<EmptyTippers />}
      />
    </SafeView>
  );
}

export default TipDetailScreen;
