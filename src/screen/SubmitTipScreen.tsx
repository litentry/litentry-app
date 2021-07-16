import * as React from 'react';
import {useContext, useReducer} from 'react';
import {Button, Card, Input, ListItem, Text} from '@ui-kitten/components';
import globalStyles, {standardPadding} from 'src/styles';
import {NavigationProp} from '@react-navigation/native';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useAccounts} from 'context/AccountsContext';
import {ChainApiContext} from 'context/ChainApiContext';
import {u8aToString} from '@polkadot/util';
import Identicon from '@polkadot/reactnative-identicon';
import Padder from 'presentational/Padder';
import {TxContext} from 'context/TxContext';
import {useQueryClient} from 'react-query';
import {useAccountIdentityInfo} from 'src/api/hooks/useAccountIdentityInfo';
import SafeView, {noTopEdges} from 'presentational/SafeView';
import {DashboardStackParamList} from 'src/navigation/navigation';

export function SubmitTipScreen({navigation}: {navigation: NavigationProp<DashboardStackParamList>}) {
  const {isLoading, data: account, error} = useAccount();
  const [state, dispatch] = useReducer(reducer, initialState);
  const {start} = useContext(TxContext);
  const {api} = useContext(ChainApiContext);
  const queryClient = useQueryClient();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error || !account) {
    return <Text>Something went wrong</Text>;
  }

  if (!account) {
    return <Text>Account not found in this server</Text>;
  }

  const valid = state.beneficiary && state.reason && state.reason.length > 4;

  return (
    <SafeView edges={noTopEdges}>
      <View style={styles.container}>
        <View style={globalStyles.flex}>
          <Card
            header={(p) => (
              <View {...p}>
                <Text>Sending from</Text>
              </View>
            )}
            footer={(p) => (
              <View {...p}>
                <Text category={'c1'}>{account.accountId.toString()}</Text>
              </View>
            )}>
            <ListItem
              title={account.info ? u8aToString(account.info.display.asRaw) : account.accountId.toString()}
              accessoryLeft={() => <Identicon value={account.accountId} size={30} />}
            />
          </Card>

          <Padder scale={1.5} />
          <Text>beneficiary</Text>
          <Padder scale={0.5} />
          <Input
            placeholder={'beneficiary'}
            value={state.beneficiary}
            onChangeText={(payload) => dispatch({type: 'SET_BENEFICIARY', payload})}
          />
          <Padder scale={1.5} />
          <Text>Tip reason</Text>
          <Padder scale={0.5} />
          <Input
            placeholder={'Tip reason'}
            value={state.reason}
            onChangeText={(payload) => dispatch({type: 'SET_REASON', payload})}
          />
        </View>

        <Button
          disabled={!valid}
          onPress={() => {
            if (api) {
              start({
                api,
                address: account.accountId.toString(),
                txMethod: 'tips.reportAwesome',
                params: [state.reason, state.beneficiary],
                title: 'Sending transaction tips.reportAwesome(reason, who)',
                description: "Report something reason that deserves a tip and claim any eventual the finder's fee. ",
              })
                .then(() => {
                  queryClient.invalidateQueries('tips');
                  navigation.goBack();
                })
                .catch((e) => console.warn(e));
            }
          }}>
          Sign and Submit
        </Button>
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: standardPadding * 2, paddingBottom: standardPadding * 4},
  rowContainer: {flexDirection: 'row', alignItems: 'center'},
});

function useAccount() {
  const {accounts} = useAccounts();
  const account = accounts[0]!; // TODO: remove this after merging multi view account

  return useAccountIdentityInfo(account?.address.toString());
}

type Action =
  | {type: 'SET_BENEFICIARY'; payload: string}
  | {
      type: 'SET_REASON';
      payload: string;
    };

type State = {
  beneficiary: string;
  reason: string;
};

const initialState: State = {reason: '', beneficiary: ''};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_BENEFICIARY':
      return {...state, beneficiary: action.payload};
    case 'SET_REASON':
      return {...state, reason: action.payload};
    default:
      return state;
  }
}
