import React, {useContext} from 'react';
import {Card, Layout, Spinner, Text, useTheme} from '@ui-kitten/components';
import globalStyles, {standardPadding} from 'src/styles';
import {ChainApiContext} from 'context/ChainApiContext';
import {SectionList, StyleSheet, View} from 'react-native';
import {u8aToString} from '@polkadot/util';
import {ApiPromise} from '@polkadot/api';
import {AccountId} from '@polkadot/types/interfaces';
import Identicon from '@polkadot/reactnative-identicon';
import {getAccountsIdentityInfo} from 'service/api/account';
import {EmptyView} from 'presentational/EmptyView';
import {useFormatBalance} from '../hook/useFormatBalance';
import {useQuery} from 'react-query';
import SafeView, {noTopEdges} from 'presentational/SafeView';
import {Account} from 'layout/Account';
import Padder from 'presentational/Padder';

export function TreasuryScreen() {
  const theme = useTheme();
  const {isLoading, data, refetch} = useTreasuryInfo();

  const groupedData = [
    {title: 'Proposals', data: data?.proposals.proposals ?? []},
    {title: 'Approved', data: data?.proposals.approvals ?? []},
  ];

  const formatBalance = useFormatBalance();

  return (
    <Layout style={globalStyles.flex}>
      <SafeView edges={noTopEdges}>
        {!data ? (
          <View style={globalStyles.centeredContainer}>
            <Spinner />
          </View>
        ) : (
          <SectionList
            contentContainerStyle={styles.sectionList}
            refreshing={isLoading}
            onRefresh={refetch}
            sections={groupedData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => {
              const accountInfo = data?.accountInfos.find(
                (i) => i.accountId.toString() === item.proposal.proposer.toString(),
              );
              const proposer = accountInfo?.info
                ? u8aToString(accountInfo.info.display.asRaw)
                : accountInfo?.accountId.toString() ?? 'unknown';
              return (
                <Card style={styles.card}>
                  <View style={styles.row}>
                    <Identicon value={item.proposal.proposer} size={30} />
                    <Text style={styles.name} category={'c1'} numberOfLines={1} ellipsizeMode="middle">
                      {proposer}
                    </Text>
                    <View style={styles.itemRight}>
                      <Text category={'c2'}>{formatBalance(item.proposal.value)}</Text>
                      {/* <Icon name={'arrow-right-outline'} style={globalStyles.icon} fill={theme['color-basic-500']} /> */}
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text>beneficiary: </Text>
                    <Account id={item.proposal.beneficiary.toString()}>
                      {({info, accountId}) => (
                        <View style={[styles.row, styles.accountsRow]}>
                          <Identicon value={accountId} size={20} />
                          <Padder scale={0.3} />
                          <Text numberOfLines={1} category={'c1'} ellipsizeMode="middle">
                            {info ? u8aToString(info.display.asRaw) : accountId.toString()}
                          </Text>
                        </View>
                      )}
                    </Account>
                  </View>
                  <View style={styles.row}>
                    <Text category="c1">bond: </Text>
                    <Text category={'c1'} numberOfLines={1} ellipsizeMode="middle">
                      {formatBalance(item.proposal.bond)}
                    </Text>
                  </View>
                </Card>
              );
            }}
            renderSectionHeader={({section: {title, data}}) => {
              return (
                <View style={[styles.header, {backgroundColor: theme['color-basic-100']}]}>
                  <Text category={'s1'}>{title}</Text>
                  <Text category={'p2'}>{`${data.length}`}</Text>
                </View>
              );
            }}
            ListEmptyComponent={EmptyView}
          />
        )}
      </SafeView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  accountsRow: {flex: 1, marginRight: 20},
  sectionList: {
    padding: standardPadding,
  },
  card: {
    marginBottom: standardPadding,
  },
  beneficiary: {
    flex: 1,
  },
  header: {justifyContent: 'space-between', flexDirection: 'row', padding: standardPadding * 2},
  name: {marginLeft: 10, flex: 1},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRight: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingLeft: standardPadding},
});

function useTreasuryInfo() {
  const {api} = useContext(ChainApiContext);

  return useQuery(['treasury_info'], () => (api ? getTreasuryInfo(api) : undefined));
}

async function getTreasuryInfo(api: ApiPromise) {
  const proposals = await api.derive.treasury.proposals();
  const accountIds: AccountId[] = [];

  for (const p of proposals.proposals) {
    if (!accountIds.includes(p.proposal.proposer)) {
      accountIds.push(p.proposal.proposer);
    }
  }
  for (const p of proposals.approvals) {
    if (!accountIds.includes(p.proposal.proposer)) {
      accountIds.push(p.proposal.proposer);
    }
  }
  const accountInfos = await getAccountsIdentityInfo(accountIds, api);

  return {proposals: proposals, accountInfos: accountInfos};
}
