import React from 'react';
import {Button, Divider, Icon, Layout, ListItem, Spinner, Text} from '@ui-kitten/components';
import globalStyles, {standardPadding} from 'src/styles';
import {FlatList, StyleSheet, View} from 'react-native';
import {u8aToString} from '@polkadot/util';
import {NavigationProp} from '@react-navigation/native';
import Identicon from '@polkadot/reactnative-identicon';
import {EmptyView} from 'presentational/EmptyView';
import {useCouncilMembers} from 'src/api/hooks/useCouncilMembers';
import SafeView, {noTopEdges} from 'presentational/SafeView';
import {motionsScreen} from 'src/navigation/routeKeys';
import {DashboardStackParamList} from 'src/navigation/navigation';

export function CouncilScreen({navigation}: {navigation: NavigationProp<DashboardStackParamList>}) {
  const {data, isLoading} = useCouncilMembers();

  return (
    <Layout style={globalStyles.flex}>
      <SafeView edges={noTopEdges}>
        <View style={styles.header}>
          <Button
            status={'basic'}
            onPress={() => navigation.navigate(motionsScreen)}
            accessoryLeft={(props) => <Icon {...props} name={'activity-outline'} />}>
            Motions
          </Button>
        </View>
        {isLoading ? (
          <View style={globalStyles.centeredContainer}>
            <Spinner />
          </View>
        ) : (
          <>
            <View style={styles.listHeader}>
              <Text category={'s1'}>Members</Text>
              <Text category={'p2'}>{`seats ${data?.members.length}/${data?.members.length}`}</Text>
            </View>
            <FlatList
              style={globalStyles.flex}
              contentContainerStyle={styles.content}
              data={data?.members}
              renderItem={({item}) => {
                const text = item.info ? u8aToString(item.info.display.asRaw) : item.accountId.toString();
                return <ListItem title={text} accessoryLeft={() => <Identicon value={item.accountId} size={30} />} />;
              }}
              keyExtractor={(item, index) => item.accountId.toString() ?? index.toString()}
              ItemSeparatorComponent={Divider}
              ListEmptyComponent={EmptyView}
            />
          </>
        )}
      </SafeView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: standardPadding * 2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  listHeader: {justifyContent: 'space-between', flexDirection: 'row', padding: standardPadding * 3},
  content: {paddingVertical: standardPadding, paddingHorizontal: standardPadding * 2},
});
