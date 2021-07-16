import React, {useState, useEffect} from 'react';
import {StyleSheet, Dimensions, View} from 'react-native';
import {Layout, Text, Icon, IconProps, ListItem} from '@ui-kitten/components';
import {formatBalance} from '@polkadot/util';
import LoadingView from 'presentational/LoadingView';
import {ApiPromise} from '@polkadot/api';
import {AccountInfo} from '@polkadot/types/interfaces';
import Identicon from '@polkadot/reactnative-identicon';
import JudgmentStatus from 'presentational/JudgmentStatus';
import {NetworkType} from 'src/types';
import useAccountDetail from 'src/api/hooks/useAccountDetail';

const {height} = Dimensions.get('window');

type PropTypes = {
  api?: ApiPromise;
  network: NetworkType;
  address: string;
};

const OnelineAddressStyle = {
  numberOfLines: 1,
  style: {width: '50%'},
};

function AddressInfoPreview(props: PropTypes) {
  const {address, api, network} = props;
  const [account, setAccount] = useState<AccountInfo>();
  const [inProgress, setInProgress] = useState(false);

  const {display, detail} = useAccountDetail(network?.key, address, api);
  const identity = detail?.data;

  useEffect(() => {
    if (api) {
      setInProgress(true);
      api.query.system.account(address).then((acc) => {
        setAccount(acc);

        setInProgress(false);
      });
    }
  }, [address, api]);

  return (
    <Layout style={styles.container}>
      {inProgress ? (
        <LoadingView text="Fetching Address Info" size="small" appearance="secondary" />
      ) : (
        <Layout>
          <ListItem
            title="Address"
            accessoryLeft={() => (
              <View style={{paddingHorizontal: 10}}>
                <Identicon value={address} size={20} />
              </View>
            )}
            accessoryRight={() => (
              <Text
                selectable
                category="label"
                {...OnelineAddressStyle}
                ellipsizeMode="middle"
                numberOfLines={1}
                style={{width: '50%'}}>
                {address}
              </Text>
            )}
          />
          <ListItem
            title="Display"
            accessoryLeft={(iconProps: IconProps) => <Icon {...iconProps} name="person-outline" />}
            accessoryRight={() => (
              <Text
                selectable
                category="label"
                numberOfLines={1}
                style={{width: '50%', textAlign: 'right'}}
                ellipsizeMode="middle">
                {display || 'untitled account'}
              </Text>
            )}
          />
          {account && (
            <ListItem
              title="Balance"
              accessoryLeft={(iconProps: IconProps) => <Icon {...iconProps} name="credit-card-outline" />}
              accessoryRight={() => (
                <Text selectable category="label">
                  {formatBalance(account.data.free.add(account.data.reserved))}
                </Text>
              )}
            />
          )}
          {identity &&
            identity.judgements[0] && ( // bug
              <ListItem
                title="Judgment"
                accessoryLeft={(iconProps: IconProps) => <Icon {...iconProps} name="ribbon-outline" pack="ionic" />}
                accessoryRight={() =>
                  identity?.judgements[0] ? <JudgmentStatus judgement={identity.judgements[0]} /> : <View />
                }
              />
            )}
          <ListItem
            title="Network"
            accessoryLeft={(iconProps: IconProps) => <Icon {...iconProps} name="planet" pack="ionic" />}
            accessoryRight={() => (
              <Text selectable category="label">
                {network.name}
              </Text>
            )}
          />
        </Layout>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {minHeight: height * 0.3},
});

export default AddressInfoPreview;
