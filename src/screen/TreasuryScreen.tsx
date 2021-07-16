import React, {useContext} from 'react';
import {Divider, Icon, Layout, Spinner, Text, useTheme} from '@ui-kitten/components';
import globalStyles, {standardPadding} from 'src/styles';
import {ChainApiContext} from 'context/ChainApiContext';
import {SectionList, StyleSheet, View} from 'react-native';
import {u8aToString} from '@polkadot/util';
import {ApiPromise} from '@polkadot/api';
import {AccountId} from '@polkadot/types/interfaces';
import Identicon from '@polkadot/reactnative-identicon';
import {getAccountsIdentityInfo} from 'src/api/queryFunctions/getAccountsIdentityInfo';
import {EmptyView} from 'presentational/EmptyView';
import {useFormatBalance} from 'src/api/hooks/useFormatBalance';
import {useQuery} from 'react-query';
import SafeView, {noTopEdges} from 'presentational/SafeView';

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
            refreshing={isLoading}
            onRefresh={refetch}
            sections={groupedData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({item}) => {
              const accountInfo = data?.accountInfos.find(
                (i) => i.accountId.toString() === item.proposal.proposer.toString(),
              );
              const text = accountInfo?.info
                ? u8aToString(accountInfo.info.display.asRaw)
                : accountInfo?.accountId.toString() ?? 'unknown';
              return (
                <View style={styles.item}>
                  <Identicon value={item.proposal.proposer} size={30} />
                  <Text style={styles.name}>{text}</Text>
                  <View style={styles.itemRight}>
                    <Text category={'c1'}>{formatBalance(item.proposal.value)}</Text>
                    <Icon name={'arrow-right-outline'} style={globalStyles.icon} fill={theme['color-basic-500']} />
                  </View>
                </View>
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
            ItemSeparatorComponent={Divider}
            ListEmptyComponent={EmptyView}
          />
        )}
      </SafeView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {justifyContent: 'space-between', flexDirection: 'row', padding: standardPadding * 2},
  name: {marginLeft: 10, flex: 1},
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: standardPadding,
    paddingHorizontal: standardPadding * 2,
  },
  itemRight: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},
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
  const accountInfos = await getAccountsIdentityInfo(api, accountIds);

  return {proposals: proposals, accountInfos: accountInfos};
}
