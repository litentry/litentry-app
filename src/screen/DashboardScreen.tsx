import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Button, Divider, Icon, IconProps, Layout, Text, TopNavigationAction} from '@ui-kitten/components';
import {useAccounts} from 'context/AccountsContext';
import {ChainApiContext} from 'context/ChainApiContext';
import {NetworkContext} from 'context/NetworkContext';
import CouncilSummaryTeaser from 'layout/CouncilSummaryTeaser';
import {ReferendaSummaryTeaser} from 'layout/ReferendaSummaryTeaser';
import TipsSummaryTeaser from 'layout/tips/TipsSummaryTeaser';
import TreasurySummaryTeaser from 'layout/TreasurySummaryTeaser';
import FadeInAnimatedView from 'presentational/FadeInAnimatedView';
import NetworkItem from 'presentational/NetworkItem';
import SafeView, {noTopEdges} from 'presentational/SafeView';
import React, {useContext, useState} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import NetworkSelect from 'src/layout/NetworkSelect';
import {ApiLoadedParamList, DashboardStackParamList, DrawerParamList} from 'src/navigation/navigation';
import {addAccountScreen, councilScreen, referendaScreen, tipsScreen, treasuryScreen} from 'src/navigation/routeKeys';
import LoadingView from 'src/presentational/LoadingView';
import globalStyles from 'src/styles';

type PropTypes = {
  navigation: CompositeNavigationProp<
    CompositeNavigationProp<StackNavigationProp<DashboardStackParamList>, StackNavigationProp<ApiLoadedParamList>>,
    DrawerNavigationProp<DrawerParamList>
  >;
};

const AddIcon = (props: IconProps) => <Icon {...props} name="person-add-outline" />;

function DashboardScreen({navigation}: PropTypes) {
  const {accounts, isLoading} = useAccounts();
  const [networkSelectOpen, setNetworkSelectOpen] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: DashboardHeaderLeft,
      headerRight: () => <View />,
      headerTitle: () => <DashboardTitle setNetworkSelectOpen={setNetworkSelectOpen} />,
    });
  }, [navigation, setNetworkSelectOpen]);

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <SafeView edges={noTopEdges}>
      <Divider style={styles.divider} />
      <FadeInAnimatedView>
        {!accounts.length ? (
          <Layout style={styles.container} level="1">
            <Button
              size="large"
              appearance="ghost"
              onPress={() => navigation.navigate(addAccountScreen)}
              accessoryLeft={AddIcon}>
              Add Account
            </Button>
          </Layout>
        ) : (
          <>
            <View style={[globalStyles.flex, styles.main]}>
              <ScrollView style={styles.scrollView}>
                <ReferendaSummaryTeaser onMorePress={() => navigation.navigate(referendaScreen)} />
                <CouncilSummaryTeaser onMorePress={() => navigation.navigate(councilScreen)} />
                <TreasurySummaryTeaser onMorePress={() => navigation.navigate(treasuryScreen)} />
                <TipsSummaryTeaser onMorePress={() => navigation.navigate(tipsScreen)} />
              </ScrollView>
            </View>
          </>
        )}
      </FadeInAnimatedView>
      <NetworkSelect open={networkSelectOpen} onClose={() => setNetworkSelectOpen(false)} />
    </SafeView>
  );
}

const styles = StyleSheet.create({
  main: {},
  scrollView: {},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  divider: {height: 2},
});

export default DashboardScreen;

export function DashboardHeaderLeft() {
  const navigation: PropTypes['navigation'] = useNavigation();
  return <TopNavigationAction onPress={navigation.openDrawer} icon={(p) => <Icon {...p} name={'menu-2-outline'} />} />;
}

function DashboardTitle({setNetworkSelectOpen}: {setNetworkSelectOpen: (v: boolean) => void}) {
  const {currentNetwork} = useContext(NetworkContext);
  const {status} = useContext(ChainApiContext);

  return (
    <TouchableOpacity style={styles.titleContainer} onPress={() => setNetworkSelectOpen(true)}>
      <Text category="s1">Litentry</Text>
      {currentNetwork ? <NetworkItem item={currentNetwork} isConnected={status === 'ready'} /> : null}
    </TouchableOpacity>
  );
}
