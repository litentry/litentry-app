import React, {useContext} from 'react';
import {useQueryClient} from 'react-query';
import {Button, Card, Divider, ListItem, Text} from '@ui-kitten/components';
import {FlatList, StyleSheet, View} from 'react-native';
import {formatNumber} from '@polkadot/util';
import type {DeriveCollectiveProposal} from '@polkadot/api-derive/types';

import {ChainApiContext} from 'context/ChainApiContext';
import {TxContext} from 'context/TxContext';
import {EmptyView} from 'presentational/EmptyView';
import Padder from 'presentational/Padder';
import {useAccounts} from 'context/AccountsContext';
import {useVotingStatus} from 'src/api/hooks/useVotingStatus';
import {useCouncilMembers} from 'src/api/hooks/useCouncilMembers';
import SafeView, {noTopEdges} from 'presentational/SafeView';
import {ProposalInfo} from 'presentational/ProposalInfo';
import {useMotions} from 'src/api/hooks/useMotions';
import {standardPadding} from 'src/styles';

export function MotionsScreen() {
  const {data, refetch, isLoading} = useMotions();

  return (
    <SafeView edges={noTopEdges}>
      <FlatList
        refreshing={isLoading}
        onRefresh={refetch}
        style={styles.flatList}
        data={data}
        renderItem={({item}) => {
          return <Motion item={item} />;
        }}
        ItemSeparatorComponent={Divider}
        keyExtractor={(item) => item.hash.toHex()}
        ListEmptyComponent={EmptyView}
      />
    </SafeView>
  );
}

const styles = StyleSheet.create({flatList: {padding: standardPadding * 2}});

function Motion({item}: {item: DeriveCollectiveProposal}) {
  const {api} = useContext(ChainApiContext);
  const {start} = useContext(TxContext);
  const {accounts} = useAccounts();
  const account = accounts?.[0];

  const {votes, proposal, hash} = item;
  const {data} = useCouncilMembers();
  const membersCount = data?.members.length ?? 0;
  const {isCloseable, isVoteable} = useVotingStatus(votes, membersCount, 'council');

  const queryClient = useQueryClient();

  const onPressClose = () => {
    if (api && account) {
      start({
        api,
        address: account.address,
        title: 'treasury.approveProposal',
        description:
          'Approve a proposal. At a later time, the proposal will be allocated to the beneficiary and the original deposit will be returned.',
        params: api.tx.council.close?.meta.args.length === 4 ? [hash, votes?.index, 0, 0] : [hash, votes?.index],
        txMethod: 'council.close',
      })
        .then(() => {
          return queryClient.invalidateQueries('motions');
        })
        .catch((e) => console.warn(e));
    }
  };

  const onPressNay = () => {
    if (api && account) {
      start({
        api,
        address: account.address,
        title: 'council.vote(proposal, index, approve)',
        description: 'Add a nay vote for the sender to the given proposal.',
        params: [hash, votes?.index, false],
        txMethod: 'council.vote',
      })
        .then(() => queryClient.invalidateQueries('motions'))
        .catch((e) => console.warn(e));
    }
  };

  const onPressAye = () => {
    if (api && account) {
      start({
        api,
        address: account.address,
        title: 'council.vote(proposal, index, approve)',
        description: 'Add an aye vote for the sender to the given proposal.',
        params: [hash, votes?.index, true],
        txMethod: 'council.vote',
      })
        .then(() => queryClient.invalidateQueries('motions'))
        .catch((e) => console.warn(e));
    }
  };

  return (
    <Card style={motionStyle.container}>
      <ListItem
        accessoryLeft={() => {
          return <Text category={'h4'}>{formatNumber(votes?.index)}</Text>;
        }}
        accessoryRight={() => {
          return (
            <>
              <Text category={'c1'}>{`Aye ${votes?.ayes.length}/${membersCount} `}</Text>
              <Padder scale={0.5} />
              {(() => {
                if (data?.isMember) {
                  if (isCloseable) {
                    return (
                      <View>
                        <Button status={'warning'} size={'tiny'} onPress={onPressClose}>
                          Close
                        </Button>
                      </View>
                    );
                  } else if (isVoteable) {
                    return (
                      <View style={motionStyle.buttons}>
                        <Button status={'danger'} size={'tiny'} onPress={onPressNay}>
                          Nay
                        </Button>
                        <Padder scale={0.5} />
                        <Button status={'success'} size={'tiny'} onPress={onPressAye}>
                          Aye
                        </Button>
                      </View>
                    );
                  }
                }
              })()}
            </>
          );
        }}
      />
      <ProposalInfo proposal={proposal} />
    </Card>
  );
}

const motionStyle = StyleSheet.create({
  container: {marginBottom: standardPadding},
  buttons: {display: 'flex', flexDirection: 'row'},
});
