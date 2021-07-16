import React, {useState} from 'react';
import {Button, Icon, Layout, Text, useTheme} from '@ui-kitten/components';
import SafeView from 'presentational/SafeView';
import {Platform, StyleSheet, View} from 'react-native';
import globalStyles, {standardPadding} from 'src/styles';
import Padder from 'presentational/Padder';
import {NavigationProp, useNavigationState} from '@react-navigation/native';
import messaging, {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {useQuery} from 'react-query';
import {AppStackParamList} from 'src/navigation/navigation';
import {apiLoadingScreen, apiLoadedNavigatorScreen} from 'src/navigation/routeKeys';
import * as AsyncStorage from 'src/service/AsyncStorage';

export function PermissionGrantingPrompt({navigation}: {navigation: NavigationProp<AppStackParamList>}) {
  const routeNames = useNavigationState((state) => state.routeNames);
  const theme = useTheme();

  const [error, setError] = useState<string>();

  const onSkip = () => {
    AsyncStorage.setItem(PERMISSION_GRANTING_SCREEN_SHOWN, true);
    navigation.navigate(routeNames.includes(apiLoadedNavigatorScreen) ? apiLoadedNavigatorScreen : apiLoadingScreen);
  };

  const onRequestPermissions = async () => {
    try {
      const status = await messaging().requestPermission();
      if (permissionAllowed(status)) {
        onSkip();
      } else {
        setError('Permission denied, please turn the notification on in the settings app!');
      }
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Layout style={globalStyles.flex}>
      <SafeView>
        <View style={styles.container}>
          <Icon style={styles.icon} name={'bell-outline'} fill={theme['color-success-500']} />
          <Padder scale={1} />
          <Text category={'h4'}>Turn on Notifications</Text>
          <Padder scale={1} />
          <Text category={'p1'} style={globalStyles.textCenter}>
            Enable notifications to make sure you don't miss out on important events
          </Text>
          {error ? (
            <>
              <Padder scale={1} />
              <Text status={'danger'} style={globalStyles.textCenter}>
                {error}
              </Text>
            </>
          ) : null}
          <Padder scale={2} />
          <Button status={'success'} onPress={onRequestPermissions}>
            Allow Notifications
          </Button>
          <Padder scale={0.5} />
          <Button appearance={'ghost'} status={'success'} onPress={onSkip}>
            Skip
          </Button>
        </View>
      </SafeView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  icon: {width: 180, height: 180},
  container: {alignItems: 'center', justifyContent: 'center', flex: 1, padding: standardPadding * 4},
});

function permissionAllowed(status: FirebaseMessagingTypes.AuthorizationStatus) {
  return status === messaging.AuthorizationStatus.AUTHORIZED || status === messaging.AuthorizationStatus.PROVISIONAL;
}

const PERMISSION_GRANTING_SCREEN_SHOWN = 'PERMISSION_GRANTING_SCREEN_SHOWN';

export function useShowPushPermissionScreen() {
  return useQuery('permission_granted', async () => {
    return (
      Platform.OS === 'ios' &&
      (await AsyncStorage.getItem<boolean>(PERMISSION_GRANTING_SCREEN_SHOWN)) !== true &&
      !permissionAllowed(await messaging().hasPermission())
    );
  });
}
