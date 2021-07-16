import React, {useRef, useContext} from 'react';
import {View, StyleSheet, Dimensions, ScrollView} from 'react-native';
import {u8aToString} from '@polkadot/util';
import {Modalize} from 'react-native-modalize';
import {Text, Layout, ListItem, Divider, Icon, IconProps, Menu, MenuGroup, MenuItem} from '@ui-kitten/components';
import Identicon from '@polkadot/reactnative-identicon';
import {AccountId} from '@polkadot/types/interfaces';
import WebView from 'react-native-webview';

import {AddressDetailType} from 'src/types';
import globalStyles, {standardPadding} from 'src/styles';
import SuccessDialog from 'presentational/SuccessDialog';
import Padder from 'presentational/Padder';
import JudgmentStatus from 'presentational/JudgmentStatus';
import {buildAddressDetailUrl} from 'src/service/Polkasembly';
import {NetworkContext} from 'context/NetworkContext';
import AddressInlineTeaser from 'layout/AddressInlineTeaser';
import InfoBanner from 'presentational/InfoBanner';
import {useSubAccounts} from 'src/api/hooks/useSubAccounts';

const {height} = Dimensions.get('window');

type PropTypes = {
  address?: string;
  display: string;
  detail: AddressDetailType;
};

const SubAccountsIcon = (props: IconProps) => <Icon {...props} pack="ionic" name="ios-people" />;

const MoreIcon = (props: IconProps) => <Icon {...props} pack="ionic" name="ios-apps-outline" />;

function DisplayJudgement(props: PropTypes) {
  const {display, detail, address} = props;
  const judgementCount = detail.data?.judgements.length || 0;
  const {currentNetwork} = useContext(NetworkContext);
  const successMsg = `This address has ${judgementCount} judgement${
    judgementCount > 1 ? 's' : ''
  } from Registrar ${detail.data?.judgements.map((judgement) => `#${judgement[0]}`).join(',')}. It's all set. 🎉`;

  const pendingJudgement = detail.data?.judgements.find((judgement) => {
    if (judgement[1].isFeePaid) {
      return true;
    }
    return false;
  });

  const identity = detail?.data;
  const modalRef = useRef<Modalize>(null);
  const {data: subAccounts} = useSubAccounts(address);
  const subAccountsArray = subAccounts?.[1];

  return (
    <ScrollView>
      <Layout style={[globalStyles.paddedContainer]}>
        <View style={{paddingHorizontal: standardPadding * 4}}>
          {pendingJudgement ? (
            <InfoBanner text={`This address has a pending judgement from #${pendingJudgement[0]}`} inline />
          ) : (
            <SuccessDialog inline text={successMsg} textStyles={styles.textStyle} />
          )}
        </View>
        <Padder scale={0.5} />
        <Divider />
        <Layout>
          <ListItem
            title="Address"
            accessoryLeft={() => (
              <View style={styles.identiconContainer}>
                <Identicon value={address} size={20} />
              </View>
            )}
            accessoryRight={() => (
              <Text selectable category="label" numberOfLines={1} style={styles.textDisplay} ellipsizeMode="middle">
                {address}
              </Text>
            )}
          />
          <ListItem
            title="Display"
            accessoryLeft={(iconProps: IconProps) => <Icon {...iconProps} name="person-outline" />}
            accessoryRight={() => (
              <Text selectable category="label" numberOfLines={1} style={styles.textDisplay} ellipsizeMode="middle">
                {display || 'untitled account'}
              </Text>
            )}
          />
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
          <Menu style={styles.menu}>
            <MenuGroup title=" Identity detail" accessoryLeft={MoreIcon}>
              <MenuItem
                title="Legal"
                accessoryLeft={(p) => <Icon {...p} name="award-outline" />}
                accessoryRight={() => (
                  <Text selectable category="label">
                    {u8aToString(detail?.data?.info.legal.asRaw) || 'Unset'}
                  </Text>
                )}
              />
              <MenuItem
                title="Email"
                accessoryLeft={(p) => <Icon {...p} name="email-outline" />}
                accessoryRight={() => (
                  <Text selectable category="label">
                    {u8aToString(detail?.data?.info.email.asRaw) || 'Unset'}
                  </Text>
                )}
              />
              <MenuItem
                title="Twitter"
                accessoryLeft={(p) => <Icon {...p} name="twitter-outline" />}
                accessoryRight={() => (
                  <Text selectable category="label">
                    {u8aToString(detail?.data?.info.twitter.asRaw) || 'Unset'}
                  </Text>
                )}
              />
              <MenuItem
                title="Riot"
                accessoryLeft={(p) => <Icon {...p} name="message-square-outline" />}
                accessoryRight={() => (
                  <Text selectable category="label">
                    {u8aToString(detail?.data?.info.riot.asRaw) || 'Unset'}
                  </Text>
                )}
              />
              <MenuItem
                title="Web"
                accessoryLeft={(p) => <Icon {...p} name="browser-outline" />}
                accessoryRight={() => (
                  <Text selectable category="label">
                    {u8aToString(detail?.data?.info.web.asRaw) || 'Unset'}
                  </Text>
                )}
              />
            </MenuGroup>
          </Menu>

          <ListItem
            title="View externally"
            onPress={() => modalRef.current?.open()}
            accessoryLeft={(iconProps: IconProps) => <Icon {...iconProps} name="md-share" pack="ionic" />}
            accessoryRight={() => (
              <Text selectable category="label" numberOfLines={1} ellipsizeMode="middle">
                Polkascan
              </Text>
            )}
          />

          {subAccountsArray && subAccountsArray.length ? (
            <Menu style={styles.menu}>
              <MenuGroup title={`Sub accounts (${subAccountsArray.length})`} accessoryLeft={SubAccountsIcon}>
                {subAccountsArray?.map((addr: AccountId) => (
                  <MenuItem
                    key={addr.toString()}
                    accessoryRight={() => (
                      <View style={{paddingLeft: standardPadding}}>
                        <AddressInlineTeaser fullWidth address={addr.toString()} />
                      </View>
                    )}
                  />
                ))}
              </MenuGroup>
            </Menu>
          ) : null}
        </Layout>
      </Layout>
      <Modalize
        ref={modalRef}
        threshold={250}
        scrollViewProps={{showsVerticalScrollIndicator: false}}
        adjustToContentHeight
        handlePosition="outside"
        closeOnOverlayTap
        withReactModal
        useNativeDriver
        panGestureEnabled>
        <WebView
          injectedJavaScript={`(function() {
                // remove some html element
                document.querySelectorAll('.navbar')[1].remove()
            })();`}
          source={{
            uri: buildAddressDetailUrl(address || '', currentNetwork?.key || 'polkadot'),
          }}
          style={{height: height * 0.75}}
          onMessage={() => null}
        />
      </Modalize>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  identiconContainer: {
    paddingHorizontal: 10,
  },
  menu: {
    backgroundColor: 'transparent',
  },
  textDisplay: {width: '50%', textAlign: 'right', paddingEnd: 12},
  textStyle: {
    fontWeight: 'normal',
    padding: standardPadding,
  },
});

export default DisplayJudgement;
