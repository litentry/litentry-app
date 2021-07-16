import {AccountInfo} from '@polkadot/types/interfaces';
import {NavigationProp, RouteProp} from '@react-navigation/native';
import {Button, Divider, Layout} from '@ui-kitten/components';
import Balances from 'presentational/Balances';
import ModalTitle from 'presentational/ModalTitle';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Modalize} from 'react-native-modalize';
import {useAccounts} from 'src/context/AccountsContext';
import {ApiLoadedParamList, AppStackParamList} from 'src/navigation/navigation';
import {balanceScreen} from 'src/navigation/routeKeys';
import globalStyles from 'src/styles';
import {ChainApiContext} from '../context/ChainApiContext';
import {NetworkContext} from '../context/NetworkContext';

export function BalanceScreen({
  navigation,
  route,
}: {
  navigation: NavigationProp<AppStackParamList>;
  route: RouteProp<ApiLoadedParamList, typeof balanceScreen>;
}) {
  const {api} = useContext(ChainApiContext);
  const {currentNetwork} = useContext(NetworkContext);
  const {accounts} = useAccounts();
  const [balance, setBalance] = useState<AccountInfo | null>(null);

  const modalRef = useRef<Modalize>(null);
  useEffect(() => {
    modalRef.current?.open();
  }, []);

  const currentAccount = accounts.find(({address}) => address === route.params.address);
  if (!currentAccount) {
    throw new Error("Couldn't find the account ");
  }

  useEffect(() => {
    let localUnsub: () => void | null;
    if (api && currentAccount) {
      api?.query.system
        .account(currentAccount.address, (accountInfo) => {
          setBalance(accountInfo);
        })
        .then((unsub) => {
          localUnsub = unsub;
        });
    }

    return () => {
      localUnsub && localUnsub();
    };
  }, [api, currentAccount]);

  return (
    <Modalize
      ref={modalRef}
      threshold={250}
      scrollViewProps={{showsVerticalScrollIndicator: false}}
      adjustToContentHeight
      handlePosition="outside"
      onClose={navigation.goBack}
      closeOnOverlayTap
      panGestureEnabled>
      {balance && (
        <Layout level="1" style={globalStyles.paddedContainer}>
          <ModalTitle title={currentAccount.name} subtitle={` (@${currentNetwork.name})`} />
          <Divider />
          <Balances balance={balance} />
          <Divider style={globalStyles.divider} />
          <Button appearance="ghost" onPress={() => modalRef.current?.close()}>
            Close
          </Button>
        </Layout>
      )}
    </Modalize>
  );
}
