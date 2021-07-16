import React, {useCallback, useRef} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Button, Divider, Icon, Layout, ListItem, Text} from '@ui-kitten/components';
import {u8aToString} from '@polkadot/util';
import globalStyles, {standardPadding} from 'src/styles';
import JudgmentStatus from './JudgmentStatus';
import {NetworkType, SupportedNetworkType} from 'src/types';
import ModalTitle from './ModalTitle';
import {Modalize} from 'react-native-modalize';
import {Portal} from 'react-native-portalize';
import useAccountDetail from 'src/api/hooks/useAccountDetail';
import {ApiPromise} from '@polkadot/api';

type PropTypes = {
  network: NetworkType | undefined;
  address: string;
  api?: ApiPromise;
};

function AddressInfoBadge({address, network, api}: PropTypes) {
  const {detail, display} = useAccountDetail((network?.key || 'polkadot') as SupportedNetworkType, address, api);
  const modalRef = useRef<Modalize>(null);
  const onOpen = useCallback(() => {
    modalRef.current?.open();
  }, []);

  return (
    <>
      <TouchableOpacity onPress={onOpen}>
        <Layout style={styles.container}>
          <Text category="c2" selectable numberOfLines={1} style={styles.display} ellipsizeMode="middle">
            {display}
          </Text>
          <Icon name="arrow-down" style={styles.icon} fill="#ccc" animation="pulse" />
          <Layout style={globalStyles.rowContainer}>
            {detail?.data?.judgements.map((judgement) => (
              <JudgmentStatus key={String(judgement[0])} judgement={judgement} />
            ))}
          </Layout>
        </Layout>
      </TouchableOpacity>
      <Portal>
        <Modalize
          ref={modalRef}
          threshold={250}
          scrollViewProps={{showsVerticalScrollIndicator: false}}
          handlePosition="outside"
          adjustToContentHeight
          closeOnOverlayTap
          panGestureEnabled>
          <View style={styles.modal}>
            <Layout style={styles.detailContainer}>
              <Layout>
                <ModalTitle title={display} subtitle={` (@${network?.name})`} />
              </Layout>
              <Divider />
              <ListItem
                title="Display"
                accessoryLeft={(props) => <Icon {...props} name="person-outline" />}
                accessoryRight={() => (
                  <Text style={{maxWidth: '55%'}} selectable category="label" numberOfLines={1} ellipsizeMode="middle">
                    {display}
                  </Text>
                )}
              />
              <ListItem
                title="Legal"
                accessoryLeft={(props) => <Icon {...props} name="award-outline" />}
                accessoryRight={() => (
                  <Text selectable category="label">
                    {u8aToString(detail?.data?.info.legal.asRaw) || 'Unset'}
                  </Text>
                )}
              />
              <ListItem
                title="Email"
                accessoryLeft={(props) => <Icon {...props} name="email-outline" />}
                accessoryRight={() => (
                  <Text selectable category="label">
                    {u8aToString(detail?.data?.info.email.asRaw) || 'Unset'}
                  </Text>
                )}
              />
              <ListItem
                title="Twitter"
                accessoryLeft={(props) => <Icon {...props} name="twitter-outline" />}
                accessoryRight={() => (
                  <Text selectable category="label">
                    {u8aToString(detail?.data?.info.twitter.asRaw) || 'Unset'}
                  </Text>
                )}
              />
              <ListItem
                title="Riot"
                accessoryLeft={(props) => <Icon {...props} name="message-square-outline" />}
                accessoryRight={() => (
                  <Text selectable category="label">
                    {u8aToString(detail?.data?.info.riot.asRaw) || 'Unset'}
                  </Text>
                )}
              />
              <ListItem
                title="Web"
                accessoryLeft={(props) => <Icon {...props} name="browser-outline" />}
                accessoryRight={() => (
                  <Text selectable category="label">
                    {u8aToString(detail?.data?.info.web.asRaw) || 'Unset'}
                  </Text>
                )}
              />
              <Divider style={globalStyles.divider} />
              <Button appearance="ghost" onPress={() => modalRef.current?.close()}>
                Close
              </Button>
            </Layout>
          </View>
        </Modalize>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  display: {
    maxWidth: '90%',
  },
  modal: {},
  icon: {
    width: 15,
    height: 15,
    marginLeft: standardPadding / 2,
  },
  detailContainer: {padding: standardPadding * 2},
  title: {
    alignSelf: 'center',
    paddingBottom: standardPadding * 3,
  },
  padding: {
    paddingVertical: 40,
  },
});

export default AddressInfoBadge;
