import {DrawerContentComponentProps} from '@react-navigation/drawer';
import {Divider, Icon, Layout, ListItem, Text, Toggle} from '@ui-kitten/components';
import {useTheme} from 'context/ThemeContext';
import SafeView from 'presentational/SafeView';
import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {MultiAccountView} from 'screen/Drawer/MultiAccountView';
import {
  dashboardScreen,
  devScreen,
  notificationSettingsScreen,
  registrarListScreen,
  webviewScreen,
} from 'src/navigation/routeKeys';
import globalStyles, {monofontFamily, standardPadding} from 'src/styles';
import logo from 'image/logo.png';

function DrawerScreen({navigation}: DrawerContentComponentProps) {
  const {theme, toggleTheme} = useTheme();

  return (
    <SafeView>
      <Layout style={styles.container}>
        <Layout style={styles.main}>
          <TouchableOpacity style={globalStyles.paddedContainer} onPress={() => navigation.navigate(dashboardScreen)}>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logoImage} />
              <Text style={styles.slogan}>Decentralized Identity</Text>
            </View>
          </TouchableOpacity>
          <Divider />
          <MultiAccountView />
        </Layout>
        <Divider />
        <Layout style={styles.rest} level="2">
          <ListItem
            title="Dashboard"
            accessoryLeft={(props) => <Icon {...props} name="browser-outline" animation="zoom" />}
            onPress={() => navigation.navigate(dashboardScreen)}
          />
          <Divider />
          <Layout style={globalStyles.paddedContainer}>
            <Text category="h6">Settings</Text>
          </Layout>
          <ListItem
            title="Registrars"
            accessoryLeft={(props) => <Icon {...props} name="award-outline" animation="zoom" />}
            onPress={() => navigation.navigate(registrarListScreen)}
          />
          <Divider />
          <ListItem
            title="Dark theme"
            accessoryLeft={(props) => <Icon {...props} name="sun-outline" animation="zoom" />}
            accessoryRight={() => <Toggle checked={theme === 'dark'} onChange={toggleTheme} />}
          />
          <Divider />
          <ListItem
            title="About Litentry"
            description="Read more about us."
            accessoryLeft={(props) => <Icon {...props} name="hash-outline" animation="zoom" />}
            onPress={() =>
              navigation.navigate(webviewScreen, {
                title: 'About Litentry',
                uri: 'https://www.litentry.com',
              })
            }
          />
          <Divider />
          <ListItem
            title="Notifications"
            description="Personalize notifications settings."
            accessoryLeft={(props) => <Icon {...props} name="bell-outline" animation="zoom" />}
            onPress={() => navigation.navigate(notificationSettingsScreen)}
          />
          <Divider />
          {__DEV__ && (
            <>
              <ListItem
                title="Dev Kit"
                description="Here lists the helpers for devs"
                accessoryLeft={(props) => <Icon {...props} name="code-outline" animation="zoom" />}
                onPress={() => navigation.navigate(devScreen)}
              />
              <Divider />
            </>
          )}
        </Layout>
      </Layout>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, borderStartColor: 'red'},
  logoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: standardPadding * 2,
  },
  logoImage: {width: 50, height: 50},
  slogan: {
    marginLeft: standardPadding * 2,
    fontFamily: monofontFamily,
    fontSize: 12,
  },
  main: {
    height: '35%',
  },
  rest: {flex: 1},
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overflowMenu: {
    minWidth: 200,
  },
});

export default DrawerScreen;