import {
  apiLoadingScreen,
  appNavigatorScreen,
  councilScreen,
  dashboardNavigator,
  dashboardScreen,
  devScreen,
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
  referendumScreen,
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
  [referendumScreen]: {index: string};
};

type DrawerParamList = {
  [dashboardNavigator]: undefined;
  [registrarListScreen]: undefined;
  [webviewScreen]: {uri: string; title: string};
  [devScreen]: undefined;
  [notificationSettingsScreen]: undefined;
};

type AppStackParamList = {
  [appNavigatorScreen]: undefined;
  [apiLoadingScreen]: {network: SupportedNetworkType; redirectTo: string | null} | undefined;
  [permissionGrantingPromptScreen]: undefined;
};

type CompleteNavigatorParamList = AppStackParamList & DrawerParamList & DashboardStackParamList;
