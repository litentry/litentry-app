import type {DeriveReferendumExt} from '@polkadot/api-derive/types';
import {BN_ONE} from '@polkadot/util';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Card, Divider, Icon, Layout, ListItem, Text} from '@ui-kitten/components';
import {EmptyView} from 'presentational/EmptyView';
import {ProposalInfo} from 'presentational/ProposalInfo';
import SafeView, {noTopEdges} from 'presentational/SafeView';
import * as React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {useBlockTime} from 'src/hook/useBlockTime';
import {useReferendums} from 'src/hook/useReferendums';
import {useBestNumber} from 'src/hook/useVotingStatus';
import {DashboardStackParamList} from 'src/navigation/navigation';
import {referendumScreen} from 'src/navigation/routeKeys';
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
  const navigation = useNavigation<StackNavigationProp<DashboardStackParamList>>();
  const {image: {proposal} = {proposal: undefined}} = item;
  const bestNumber = useBestNumber();

  const remainBlock = bestNumber ? item.status.end.sub(bestNumber).isub(BN_ONE) : undefined;
  const {timeStringParts} = useBlockTime(remainBlock);
  if (!proposal) {
    return <Text>{item.imageHash.toString()}</Text>;
  }

  const {method, section} = proposal?.registry.findMetaCall(proposal.callIndex);
  const goToRefrenda = () => {
    navigation.navigate(referendumScreen, {index: item.index.toString()});
  };

  return (
    <Card style={referendumStyle.container} onPress={goToRefrenda}>
      <ListItem
        style={referendumStyle.item}
        title={`${method}.${section}`}
        accessoryLeft={() => <Text category={'h4'}>{item.index.toString()}</Text>}
        accessoryRight={() => (
          <View style={referendumStyle.row}>
            <Text category={'p1'} adjustsFontSizeToFit={true} numberOfLines={1}>
              {timeStringParts.slice(0, 2).join(' ')}
            </Text>
            <Icon name="chevron-right-outline" fill="grey" style={globalStyles.icon25} />
          </View>
        )}
      />
      <ProposalInfo proposal={proposal} />
    </Card>
  );
}

const referendumStyle = StyleSheet.create({
  container: {marginBottom: standardPadding},
  row: {flexDirection: 'row', alignItems: 'center'},
  item: {backgroundColor: 'transparent'},
});
