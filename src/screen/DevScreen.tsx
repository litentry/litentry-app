import React, {useCallback, useContext, useRef, useState} from 'react';
import {Button, Divider, Layout, ListItem, Text} from '@ui-kitten/components';
import {useAccounts} from 'src/context/AccountsContext';
import {InAppNotificationContent, InAppNotificationContext} from 'context/InAppNotificationContext';
import {ChainApiContext} from 'context/ChainApiContext';
import {Alert, StyleSheet, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {Modalize} from 'react-native-modalize';
import {standardPadding} from 'src/styles';
import {NetworkContext} from 'context/NetworkContext';
import RegistrarSelectionModal from 'layout/RegistrarSelectionModal';
import SafeView, {noTopEdges} from 'presentational/SafeView';

function DevScreen() {
  const [visible, setVisible] = useState(false);

  const {currentNetwork} = useContext(NetworkContext);
  const {accounts, addAccount, removeAccount} = useAccounts();
  const {trigger} = useContext(InAppNotificationContext);
  const {status, api} = useContext(ChainApiContext);
  const [debugInfo, setDebugInfo] = useState('');
  const modalRef = useRef<Modalize>(null);
  const showDebugModal = useCallback((info: string) => {
    modalRef.current?.open();
    setDebugInfo(info);
  }, []);

  return (
    <SafeView edges={noTopEdges}>
      <>
        <Layout level="1">
          <ScrollView>
            <ListItem
              title="Registrar Selection Modal"
              description="Trigger display of Registrar Selection Modal"
              accessoryRight={() => (
                <Button size="small" onPress={() => setVisible(true)}>
                  Trigger
                </Button>
              )}
            />
            <Divider />
            <RegistrarSelectionModal
              onClose={() => setVisible(false)}
              onSelect={(index, fee) => console.log(index, fee)}
              visible={visible}
            />
            <ListItem
              title={`Network: ${currentNetwork.name}`}
              description={`Currently connected to ${currentNetwork.ws}`}
              accessoryRight={() => <Button size="tiny">{status}</Button>}
            />
            <Divider />

            <ListItem
              title="Simple Notification"
              description="Show simple text in app PN"
              accessoryRight={() => (
                <Button size="small" onPress={() => trigger({type: 'TextInfo', opts: {text: 'Whatnot'}})}>
                  Trigger
                </Button>
              )}
            />
            <Divider />

            <ListItem
              title="Show multi-lines Notification"
              description="Show multi-lines In-App-PusNotification"
              accessoryRight={() => (
                <Button
                  size="small"
                  onPress={() =>
                    trigger({
                      type: 'Component',
                      renderContent: () => (
                        <InAppNotificationContent
                          title="Tx detected"
                          message="aa very long string[a very long string[a very long string[a very long string[a very long string[]]]]]a very long string[]a very long string[a very long string[a very long string[a very long string[a very long string[]]]]]a very long string[] very long string[a very long string[a very long string[a very long string[a very long string[]]]]]a very long string[]"
                        />
                      ),
                    })
                  }>
                  Trigger
                </Button>
              )}
            />
            <Divider />
            {accounts.map((account) => (
              <View key={account.address}>
                <ListItem
                  title={`Remove account ${account.address}`}
                  description="Reset current stored accounts"
                  accessoryRight={() => (
                    <Button
                      size="small"
                      onPress={() => {
                        removeAccount(currentNetwork.key, account);
                        Alert.alert('Info', 'Account is reset');
                      }}>
                      Trigger
                    </Button>
                  )}
                />
                <Divider />
              </View>
            ))}
            {accounts.map((account) => (
              <View key={account.address}>
                <ListItem
                  title={`Identity of ${account.address}`}
                  description="Resp of `identityOf` call of current address"
                  accessoryRight={() => (
                    <Button
                      size="small"
                      onPress={() => {
                        if (account) {
                          api?.query.identity?.identityOf(account.address).then((data) => {
                            showDebugModal(JSON.stringify(data, null, 4));
                          });
                        } else {
                          Alert.alert('Error', 'No Account connected');
                        }
                      }}>
                      Trigger
                    </Button>
                  )}
                />
                <Divider />
              </View>
            ))}
            <ListItem
              title="Set Address"
              description="Manually set address"
              accessoryRight={() => (
                <Button
                  size="small"
                  onPress={() => {
                    addAccount(currentNetwork.key, {
                      name: 'Manu. set Acct',
                      address: '167rjWHghVwBJ52mz8sNkqr5bKu5vpchbc9CBoieBhVX714h',
                    });
                    Alert.alert('Done');
                  }}>
                  Trigger
                </Button>
              )}
            />
            <Divider />
          </ScrollView>
        </Layout>

        <Modalize
          ref={modalRef}
          threshold={250}
          scrollViewProps={{showsVerticalScrollIndicator: false}}
          adjustToContentHeight
          handlePosition="outside"
          closeOnOverlayTap
          panGestureEnabled>
          <Layout style={styles.devModal}>
            <Text category="s1" style={styles.debugHeader}>
              Debug Info
            </Text>
            <Divider />
            <ScrollView style={styles.scrollView}>
              <Text>{debugInfo}</Text>
            </ScrollView>
          </Layout>
        </Modalize>
      </>
    </SafeView>
  );
}
const styles = StyleSheet.create({
  devModal: {
    maxHeight: 400,
    height: 400,
  },
  debugHeader: {
    paddingVertical: standardPadding * 2,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  scrollView: {
    padding: standardPadding,
    flex: 1,
    height: 400,
  },
});

export default DevScreen;
