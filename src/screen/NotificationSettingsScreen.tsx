import {DrawerNavigationProp} from '@react-navigation/drawer';
import {Divider, Icon, Layout, ListItem, Text} from '@ui-kitten/components';
import LoadingView from 'presentational/LoadingView';
import Padder from 'presentational/Padder';
import SafeView, {noTopEdges} from 'presentational/SafeView';
import React from 'react';
import {StyleSheet, Switch, View} from 'react-native';
import {usePushTopics} from 'src/hook/usePushTopics';
import {DrawerParamList} from 'src/navigation/navigation';
import globalStyles, {standardPadding} from 'src/styles';

type PropTypes = {
  navigation: DrawerNavigationProp<DrawerParamList>;
};

export function NotificationSettingsScreen({}: PropTypes) {
  const {topics, toggleTopic, isLoading} = usePushTopics();

  return (
    <SafeView edges={noTopEdges}>
      <Layout level="1" style={styles.container}>
        <Text>Hi there! To stay informed choose which Push Notifications you'd like to receive.</Text>
        <Padder scale={2} />
        <Divider />
        <Padder scale={1} />
        <View style={globalStyles.flex}>
          {isLoading ? (
            <LoadingView />
          ) : (
            topics.map((item) => (
              <ListItem
                key={item.id}
                title={item.label}
                accessoryRight={() => (
                  <Switch value={item.selected} onValueChange={(subscribe) => toggleTopic({id: item.id, subscribe})} />
                )}
              />
            ))
          )}
          <Padder scale={1} />
          <Divider />
        </View>
        <ListItem
          accessoryLeft={(p) => <Icon {...p} name={'info-outline'} />}
          title={"Don't forget to enable notifications in your phone's settings"}
        />
      </Layout>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: standardPadding * 3,
  },
});
