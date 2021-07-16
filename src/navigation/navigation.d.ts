import {
  addAccountScreen,
  apiLoadingScreen,
  apiLoadedNavigatorScreen,
  balanceScreen,
  councilScreen,
  dashboardNavigator,
  dashboardScreen,
  devScreen,
  drawerNavigatorScreen,
  motionDetailScreen,
  motionsScreen,
  myIdentityScreen,
  notificationSettingsScreen,
  referendaScreen,
  permissionGrantingPromptScreen,
  registrarListScreen,
  submitTipScreen,
  tipDetailScreen,
  tipsScreen,
  treasuryScreen,
  webviewScreen,
} from 'src/navigation/routeKeys';
import {SupportedNetworkType} from 'src/types';

type DashboardStackParamList = {
  [dashboardScreen]: undefined;
  [motionDetailScreen]: {
    id: number;
    hash: string;
  };
  [tipsScreen]: undefined;
  [tipDetailScreen]: {
    hash: string;
  };
  [councilScreen]: undefined;
  [submitTipScreen]: undefined;
  [treasuryScreen]: undefined;
  [motionsScreen]: undefined;
  [myIdentityScreen]: {address: string};
  [referendaScreen]: undefined;
};

type DrawerParamList = {
  [dashboardNavigator]: undefined;
  [registrarListScreen]: undefined;
  [webviewScreen]: {uri: string; title: string};
  [devScreen]: undefined;
  [notificationSettingsScreen]: undefined;
};

type ApiLoadedParamList = {
  [drawerNavigatorScreen]: undefined;
  [addAccountScreen]: undefined;
  [balanceScreen]: {address: string};
};

type AppStackParamList = {
  [apiLoadedNavigatorScreen]: undefined;
  [apiLoadingScreen]: {network: SupportedNetworkType; redirectTo: string | null} | undefined;
  [permissionGrantingPromptScreen]: undefined;
};

type CompleteNavigatorParamList = AppStackParamList & DrawerParamList & ApiLoadedParamList & DashboardStackParamList;
