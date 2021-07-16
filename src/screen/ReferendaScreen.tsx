import type {DeriveReferendumExt} from '@polkadot/api-derive/types';
import {BN_ONE} from '@polkadot/util';
import {Card, Divider, Layout, ListItem, Text} from '@ui-kitten/components';
import {EmptyView} from 'presentational/EmptyView';
import {ProposalInfo} from 'presentational/ProposalInfo';
import SafeView, {noTopEdges} from 'presentational/SafeView';
import * as React from 'react';
import {FlatList, StyleSheet} from 'react-native';
import {useBlockTime} from 'src/api/hooks/useBlockTime';
import {useReferendums} from 'src/api/hooks/useReferendums';
import {useBestNumber} from 'src/api/hooks/useVotingStatus';
import globalStyles, {standardPadding} from 'src/styles';

export function ReferendaScreen() {
  const {data, isLoading, refetch} = useReferendums();

  return (
    <Layout style={globalStyles.flex}>
      <SafeView edges={noTopEdges}>
        <FlatList
          refreshing={isLoading}
          onRefresh={refetch}
          style={styles.flatList}
          data={data}
          renderItem={({item}) => {
            return <Referenda item={item} />;
          }}
          ItemSeparatorComponent={Divider}
          keyExtractor={(item) => item.index.toString()}
          ListEmptyComponent={EmptyView}
        />
      </SafeView>
    </Layout>
  );
}

const styles = StyleSheet.create({flatList: {padding: standardPadding * 2}});

function Referenda({item}: {item: DeriveReferendumExt}) {
  const {image: {proposal} = {proposal: undefined}} = item;
  const bestNumber = useBestNumber();

  const remainBlock = bestNumber ? item.status.end.sub(bestNumber).isub(BN_ONE) : undefined;
  const {timeStringParts} = useBlockTime(remainBlock);
  if (!proposal) {
    return <Text>{item.imageHash.toString()}</Text>;
  }

  const {method, section} = proposal?.registry.findMetaCall(proposal.callIndex);

  return (
    <Card style={referendumStyle.container}>
      <ListItem
        title={`${method}.${section}`}
        accessoryLeft={() => <Text category={'h4'}>{item.index.toString()}</Text>}
        accessoryRight={() => (
          <Text category={'c1'} adjustsFontSizeToFit={true} numberOfLines={1}>
            {timeStringParts.slice(0, 2).join(' ')}
          </Text>
        )}
      />
      <ProposalInfo proposal={proposal} />
    </Card>
  );
}

const referendumStyle = StyleSheet.create({container: {marginBottom: standardPadding}});
