import React, {useCallback, useState} from 'react';
import BN from 'bn.js';
import {StyleSheet, Dimensions, View} from 'react-native';
import {Select, SelectItem, Modal, Card, Text, Button, IndexPath, Input, Icon, IconProps} from '@ui-kitten/components';
import {useRegistrars} from 'src/api/hooks/useRegistrars';
import {BN_ZERO} from '@polkadot/util';
import {standardPadding, monofontFamily} from 'src/styles';
import Identicon from '@polkadot/reactnative-identicon';
import Padder from 'presentational/Padder';
import {useFormatBalance} from 'src/api/hooks/useFormatBalance';

const {height, width} = Dimensions.get('window');

type PropTypes = {
  visible: boolean;
  onClose: () => void;
  onSelect: (index: number, fee?: BN) => void;
};

function RegistrarSelectionModal({onSelect, visible, onClose}: PropTypes) {
  const formatBalance = useFormatBalance();
  const registrars = useRegistrars();

  const [selectedRegistrar, setSelectedRegistrar] = useState<IndexPath | IndexPath[]>();
  const registrar =
    selectedRegistrar && !Array.isArray(selectedRegistrar) ? registrars[selectedRegistrar.row] : undefined;

  const handleSelect = useCallback(() => {
    const index = (selectedRegistrar as IndexPath).row;

    if (registrar) {
      onSelect(index, registrar.fee);
    }
  }, [onSelect, registrar, selectedRegistrar]);

  const feeDisplay = registrar ? formatBalance(registrar.fee) : '';
  const selectedRegistrarDisplay = selectedRegistrar ? `Registrar #${(selectedRegistrar as IndexPath).row}` : undefined;

  if (!registrars) {
    return null;
  }

  return (
    <Modal visible={visible} style={styles.container} backdropStyle={styles.backdrop} onBackdropPress={onClose}>
      <Card
        disabled={true}
        header={(props) => (
          <>
            <Text {...props} style={[props?.style, styles.headerStyleOverwrite]} category="h6">
              Choose registrar
            </Text>
            <Text {...props} style={[props?.style, styles.subHeaderOverwrite]} category="s2">
              Select a registrar and specify fee
            </Text>
          </>
        )}
        footer={(props) => (
          <View {...props} style={[props?.style, styles.footerContainer]}>
            <Button style={styles.footerControl} appearance="ghost" size="small" onPress={onClose} status="danger">
              Cancel
            </Button>
            <Button style={styles.footerControl} size="small" onPress={handleSelect}>
              Submit
            </Button>
          </View>
        )}>
        <Select
          label="Registrar"
          multiSelect={false}
          selectedIndex={selectedRegistrar}
          value={selectedRegistrarDisplay}
          onSelect={setSelectedRegistrar}>
          {registrars.map((registrar, index) => {
            return (
              <SelectItem
                disabled={registrar.fee.eq(BN_ZERO)}
                key={registrar.account.toString()}
                accessoryLeft={() => {
                  return <Identicon value={registrar.account.toString()} size={20} />;
                }}
                title={`#${index}`}
                accessoryRight={() => <Text style={styles.indexText}>{formatBalance(registrar.fee)}</Text>}
              />
            );
          })}
        </Select>
        <Padder scale={0.5} />
        <Input
          disabled
          value={feeDisplay}
          label="Fee"
          placeholder="Fee for judgement"
          caption="Fee paid to Registrar for providing the Judgement"
          accessoryRight={(props: IconProps) => <Icon {...props} name="alert-circle-outline" />}
        />
      </Card>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.8,
    minHeight: height * 0.5,
  },
  subHeaderOverwrite: {
    paddingTop: standardPadding / 2,
  },
  headerStyleOverwrite: {
    paddingBottom: 0,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  footerControl: {
    marginHorizontal: 2,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  addressText: {
    paddingLeft: standardPadding,
  },
  indexText: {
    paddingLeft: standardPadding,
    fontFamily: monofontFamily,
  },
});

export default RegistrarSelectionModal;
