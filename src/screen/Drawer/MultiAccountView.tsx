import Identicon from '@polkadot/reactnative-identicon';
import {CompositeNavigationProp, NavigationProp, useNavigation} from '@react-navigation/native';
import {Icon, Layout, ListItem, MenuItem, OverflowMenu} from '@ui-kitten/components';
import {ChainApiContext} from 'context/ChainApiContext';
import {NetworkContext} from 'context/NetworkContext';
import AddressInfoBadge from 'presentational/AddressInfoBadge';
import React, {useContext, useState} from 'react';
import {Alert, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {useAccounts, Account} from 'src/context/AccountsContext';
import {ApiLoadedParamList, DashboardStackParamList} from 'src/navigation/navigation';
import {addAccountScreen, balanceScreen, myIdentityScreen} from 'src/navigation/routeKeys';
import globalStyles, {colorGray} from 'src/styles';
import {SupportedNetworkType} from 'src/types';

export function MultiAccountView() {
  const navigation = useNavigation();
  const {accounts, removeAccount} = useAccounts();

  return (
    <Layout level="2" style={styles.container}>
      <FlatList
        data={accounts}
        showsVerticalScrollIndicator
        renderItem={({item: account}) => (
          <AccountItem key={account.address} account={account} removeAccount={removeAccount} />
        )}
      />
      <ListItem
        style={styles.transparentBG}
        onPress={() => navigation.navigate(addAccountScreen)}
        title="Add Account"
        accessoryLeft={() => <Icon style={globalStyles.icon25} name="plus-circle-outline" fill={colorGray} />}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {paddingHorizontal: 8, flex: 1},
  transparentBG: {backgroundColor: 'transparent'},
  addAccountBtn: {
    flexDirection: 'row',
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overflowMenu: {
    minWidth: 200,
  },
});

function AccountItem({
  account,
  removeAccount,
}: {
  account: Account;
  removeAccount: (network: SupportedNetworkType, acc: Account) => void;
}) {
  const {api} = useContext(ChainApiContext);
  const {currentNetwork} = useContext(NetworkContext);
  const [visible, setVisible] = useState(false);
  const navigation =
    useNavigation<
      CompositeNavigationProp<NavigationProp<ApiLoadedParamList>, NavigationProp<DashboardStackParamList>>
    >();

  const handleMenuItemSelect = ({row}: {row: number}) => {
    setVisible(false);
    if (row === 0) {
      Alert.alert(
        'Confirm Account deletion',
        `Sure to delete account ${account?.address}`,
        [
          {
            text: 'Yes',
            onPress: () => {
              setVisible(false);
              if (account) {
                removeAccount(currentNetwork.key, account);
              }
            },
          },
          {
            text: 'Cancel',
            onPress: () => setVisible(false),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }

    if (row === 1) {
      navigation.navigate(balanceScreen, {address: account.address});
    }
    if (row === 2) {
      navigation.navigate(myIdentityScreen, {address: account.address});
    }
  };

  const renderOptions = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          setVisible(true);
        }}>
        <Icon name="md-options" pack="ionic" style={[globalStyles.inlineIconDimension, globalStyles.iconColor]} />
      </TouchableOpacity>
    );
  };

  return (
    <ListItem
      style={styles.transparentBG}
      accessoryLeft={() => <Identicon value={account.address} size={25} />}
      accessoryRight={() => (
        <OverflowMenu
          anchor={renderOptions}
          placement="bottom end"
          backdropStyle={styles.backdrop}
          style={styles.overflowMenu}
          visible={visible}
          onSelect={handleMenuItemSelect}
          onBackdropPress={() => setVisible(false)}>
          <MenuItem
            title="Remove Account"
            accessoryLeft={(iconProps) => <Icon name="trash-2-outline" {...iconProps} />}
          />
          <MenuItem
            title="Show balance"
            accessoryLeft={(iconProps) => <Icon {...iconProps} name="credit-card-outline" />}
          />
          <MenuItem
            title="Set identity"
            accessoryLeft={(iconProps) => <Icon {...iconProps} name="person-add-outline" />}
          />
        </OverflowMenu>
      )}
      title={() => <AddressInfoBadge network={currentNetwork} address={account.address} api={api} />}
    />
  );
}
