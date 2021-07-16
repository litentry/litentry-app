import React, {useContext} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {Icon, TopNavigationAction} from '@ui-kitten/components';
import DrawerScreen from 'screen/Drawer/DrawerScreen';
import DashboardScreen, {DashboardHeaderLeft} from 'screen/DashboardScreen';
import MotionDetailScreen from 'screen/MotionDetailScreen';
import TipsScreen from 'screen/tips/TipsScreen';
import TipDetailScreen from 'screen/tips/TipDetailScreen';
import RegistrarListScreen from 'screen/RegistrarListScreen';
import WebviewScreen from 'screen/WebviewScreen';
import DevScreen from 'screen/DevScreen';
import MyIdentityScreen from 'screen/MyIdentityScreen';
import * as routeKeys from 'src/navigation/routeKeys';
import {ChainApiContext} from 'context/ChainApiContext';
import {ApiLoadingScreen} from 'screen/ApiLoadingScreen';
import {CouncilScreen} from 'screen/Council/CouncilScreen';
import {SubmitTipScreen} from 'screen/SubmitTipScreen';
import {TreasuryScreen} from 'screen/TreasuryScreen';
import {MotionsScreen} from 'screen/Council/MotionsScreen';
import {NotificationSettingsScreen} from 'screen/NotificationSettingsScreen';
import {
  ApiLoadedParamList,
  AppStackParamList,
  DashboardStackParamList,
  DrawerParamList,
} from 'src/navigation/navigation';
import globalStyles from 'src/styles';
import {useTheme} from 'src/context/ThemeContext';
import {darkTheme, lightTheme} from 'src/navigation/theme';
import {useFirebase} from 'src/hook/useFirebase';
import {ReferendaScreen} from 'screen/ReferendaScreen';
import {PermissionGrantingPrompt, useShowPushPermissionScreen} from 'screen/PermissionGrantingPrompt';
import LoadingView from 'presentational/LoadingView';
import {NavigationContainer} from '@react-navigation/native';
import {AddAccountScreen} from 'screen/AddAccountScreen/AddAccountScreen';
import {BalanceScreen} from 'screen/BalanceScreen';

const DashboardStack = createStackNavigator<DashboardStackParamList>();

function DashboardStackNavigator() {
  useFirebase();

  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        headerLeftContainerStyle: {paddingHorizontal: 10},
        headerRightContainerStyle: {paddingHorizontal: 10},
        headerBackImage: ({tintColor}) => (
          <Icon
            name={'arrow-back-outline'}
            style={[globalStyles.icon25, {color: tintColor}]}
            fill={tintColor}
            pack={'ionic'}
          />
        ),
      }}>
      <DashboardStack.Screen name={routeKeys.dashboardScreen} component={DashboardScreen} />
      <DashboardStack.Screen name={routeKeys.motionDetailScreen} component={MotionDetailScreen} />
      <DashboardStack.Screen
        name={routeKeys.tipsScreen}
        component={TipsScreen}
        options={({navigation}) => ({
          headerRight: () => (
            <TopNavigationAction
              icon={(props) => <Icon {...props} name="plus-circle-outline" />}
              onPress={() => navigation.navigate(routeKeys.submitTipScreen)}
            />
          ),
        })}
      />
      <DashboardStack.Screen name={routeKeys.tipDetailScreen} component={TipDetailScreen} />
      <DashboardStack.Screen name={routeKeys.councilScreen} component={CouncilScreen} />
      <DashboardStack.Screen name={routeKeys.treasuryScreen} component={TreasuryScreen} />
      <DashboardStack.Screen name={routeKeys.submitTipScreen} component={SubmitTipScreen} />
      <DashboardStack.Screen name={routeKeys.motionsScreen} component={MotionsScreen} />
      <DashboardStack.Screen name={routeKeys.myIdentityScreen} component={MyIdentityScreen} />
      <DashboardStack.Screen name={routeKeys.referendaScreen} component={ReferendaScreen} />
    </DashboardStack.Navigator>
  );
}

const Drawer = createDrawerNavigator<DrawerParamList>();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerLeft: DashboardHeaderLeft,
      }}
      drawerContent={(props) => <DrawerScreen {...props} />}>
      <Drawer.Screen
        name={routeKeys.dashboardNavigator}
        component={DashboardStackNavigator}
        options={{headerShown: false}}
      />
      <Drawer.Screen name={routeKeys.registrarListScreen} component={RegistrarListScreen} />
      <Drawer.Screen
        name={routeKeys.webviewScreen}
        component={WebviewScreen}
        options={({route}) => ({title: route?.params?.title})}
      />
      <Drawer.Screen name={routeKeys.devScreen} component={DevScreen} />
      <Drawer.Screen name={routeKeys.notificationSettingsScreen} component={NotificationSettingsScreen} />
    </Drawer.Navigator>
  );
}

const LoadedAppStack = createStackNavigator<ApiLoadedParamList>();

function ApiLoadedNavigator() {
  return (
    <LoadedAppStack.Navigator
      headerMode="none"
      screenOptions={{
        animationEnabled: false,
        cardStyle: {
          backgroundColor: 'transparent',
          opacity: 1,
        },
        gestureEnabled: false,
      }}
      mode="modal">
      <LoadedAppStack.Screen name={routeKeys.drawerNavigatorScreen} component={DrawerNavigator} />
      <LoadedAppStack.Screen name={routeKeys.addAccountScreen} component={AddAccountScreen} />
      <LoadedAppStack.Screen name={routeKeys.balanceScreen} component={BalanceScreen} />
    </LoadedAppStack.Navigator>
  );
}

const AppStack = createStackNavigator<AppStackParamList>();

function AppNavigator() {
  const {api} = useContext(ChainApiContext);
  const {theme} = useTheme();

  const {data: showPermissionGranting, isLoading} = useShowPushPermissionScreen();

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <NavigationContainer linking={routeKeys.linking} theme={theme === 'dark' ? darkTheme : lightTheme}>
      <AppStack.Navigator headerMode={'none'} screenOptions={{gestureEnabled: false}}>
        {showPermissionGranting ? (
          <AppStack.Screen name={routeKeys.permissionGrantingPromptScreen} component={PermissionGrantingPrompt} />
        ) : undefined}
        {api ? <AppStack.Screen name={routeKeys.apiLoadedNavigatorScreen} component={ApiLoadedNavigator} /> : undefined}
        <AppStack.Screen name={routeKeys.apiLoadingScreen} component={ApiLoadingScreen} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
