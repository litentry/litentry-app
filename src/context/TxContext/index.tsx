import {ApiPromise} from '@polkadot/api';
import {SubmittableExtrinsic} from '@polkadot/api/submittable/types';
import {DispatchError} from '@polkadot/types/interfaces';
import {ITuple, SignerPayloadJSON, SignerResult} from '@polkadot/types/types';
import {BN_ZERO} from '@polkadot/util';
import {Icon, IconProps, Layout, Text} from '@ui-kitten/components';
import {PreviewStep} from 'context/TxContext/PreviewStep';
import {get} from 'lodash';
import ErrorDialog from 'presentational/ErrorDialog';
import LoadingView from 'presentational/LoadingView';
import SuccessDialog from 'presentational/SuccessDialog';
import TxPayloadQr from 'presentational/TxPayloadQr';
import React, {createContext, useCallback, useContext, useMemo, useReducer, useRef} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {Modalize} from 'react-native-modalize';
import QRCodeScanner from 'react-native-qrcode-scanner';
import QrSigner from 'src/service/QrSigner';
import globalStyles, {standardPadding} from 'src/styles';

let id = 0;

const {width, height} = Dimensions.get('window');

type PropTypes = {children: React.ReactNode};
type TxContextValueType = {
  start: (config: StartConfig) => Promise<void>;
};

export const TxContext = createContext<TxContextValueType>({
  start: () => Promise.resolve(),
});

export const useTX = () => useContext(TxContext);

const AlertIcon = (props: IconProps) => <Icon fill="#ccc" {...props} name="alert-triangle-outline" />;

type StartConfig = {
  api: ApiPromise;
  address: string;
  txMethod: string;
  params: unknown[];
  title: string;
  description: string;
};

function TxContextProvider({children}: PropTypes): React.ReactElement {
  const modalRef = useRef<Modalize>(null);
  const signatureRef = useRef<(value: SignerResult) => void>();
  const [state, dispatch] = useReducer(reducer, initialState);

  const start = useCallback(async (config: StartConfig) => {
    const {api, txMethod, params, description, address, title} = config;
    const [section, method] = txMethod.split('.');

    if (!section || !method) {
      throw new Error('section or method undefined');
    }

    if (!get(api.tx, [section, method])) {
      throw new Error(`Unable to find method ${section}.${method}`);
    }

    const transaction: SubmittableExtrinsic<'promise'> = api.tx[section]![method]!(...params);

    modalRef.current?.open();

    try {
      const f = await transaction.signAsync(address, {
        nonce: -1,
        tip: BN_ZERO,
        signer: new QrSigner((txPayload) => {
          transaction.paymentInfo(address).then((info) => {
            dispatch({
              type: 'PREVIEW',
              payload: {txPayload: txPayload, params, title, description, partialFee: info.partialFee.toNumber()},
            });
          });

          return new Promise((resolve) => {
            signatureRef.current = resolve;
          });
        }),
      });

      await new Promise((resolve, reject) => {
        f.send(({status, events}) => {
          if (status.isInBlock || status.isFinalized) {
            const errors = events
              // find/filter for failed events
              .filter(({event: {section, method}}) => section === 'system' && method === 'ExtrinsicFailed')
              // we know that data for system.ExtrinsicFailed is
              // (DispatchError, DispatchInfo)
              .map((eventRecord) => {
                const [dispatchError] = eventRecord.event.data as unknown as ITuple<[DispatchError]>;

                if (dispatchError.isModule) {
                  // for module errors, we have the section indexed, lookup
                  const decoded = api.registry.findMetaError(dispatchError.asModule);
                  const {documentation} = decoded;

                  return documentation.join(' ').trim();
                } else {
                  // Other, CannotLookup, BadOrigin, no extra info
                  return dispatchError?.toString();
                }
              });

            if (errors.length === 0 && status.isFinalized) {
              dispatch({type: 'NEXT_STEP'});
              resolve(undefined);
            }

            if (errors[0]) {
              dispatch({type: 'ERROR', payload: errors[0]});
              reject();
            }
          }
        });
      });
    } catch (e) {
      dispatch({type: 'ERROR', payload: e});
    }
  }, []);

  const modalContent = useMemo(() => {
    switch (state.step) {
      case 'none':
        return (
          <Layout style={styles.emptyState}>
            <Text>Preparing transaction payload...</Text>
          </Layout>
        );

      case 'preview':
        return (
          <PreviewStep
            transactionInfo={state.description}
            transactionTitle={state.title}
            txPayload={state.txPayload}
            params={state.params}
            partialFee={state.partialFee}
            onCancel={() => {
              modalRef.current?.close();
              dispatch({type: 'RESET'});
            }}
            onConfirm={() => dispatch({type: 'NEXT_STEP'})}
          />
        );

      case 'payload':
        return (
          <TxPayloadQr
            payload={state.txPayload}
            onCancel={() => {
              modalRef.current?.close();
              dispatch({type: 'RESET'});
            }}
            onConfirm={() => dispatch({type: 'NEXT_STEP'})}
          />
        );

      case 'submitting':
        return (
          <Layout style={styles.infoContainer}>
            <LoadingView
              text="Submitting"
              renderIcon={() => <Icon name="cloud-upload-outline" fill="#ccc" style={styles.iconText} />}
            />
          </Layout>
        );

      case 'success':
        return (
          <Layout style={styles.infoContainer}>
            <SuccessDialog
              text="Tx Success"
              onClosePress={() => {
                modalRef.current?.close();
                dispatch({type: 'RESET'});
              }}
            />
          </Layout>
        );

      case 'signature':
        return (
          // TODO: extract
          <Layout style={globalStyles.paddedContainer}>
            <QRCodeScanner
              onRead={(data) => {
                dispatch({type: 'NEXT_STEP'});
                signatureRef.current?.({
                  id: id++,
                  signature: `0x${data.data}`,
                });
              }}
              showMarker
              topContent={
                <Text style={styles.title} category="label">
                  Scanning ...
                </Text>
              }
              markerStyle={styles.marker}
              cameraStyle={styles.cameraBase}
              notAuthorizedView={
                <Layout style={styles.notAuthorized}>
                  <Layout style={styles.notAuthorizedHack}>
                    <AlertIcon style={styles.icon} />
                    <Text category="label">This requires your Camera permission to scan.</Text>
                  </Layout>
                </Layout>
              }
            />
          </Layout>
        );

      case 'error':
        return (
          <Layout style={styles.infoContainer}>
            <ErrorDialog text="Tx Failed" msg={state.error} />
          </Layout>
        );
      default:
        return null;
    }
  }, [state]);

  const value = useMemo(() => ({start}), [start]);

  return (
    <TxContext.Provider value={value}>
      {children}
      <Modalize
        ref={modalRef}
        threshold={250}
        scrollViewProps={{showsVerticalScrollIndicator: false}}
        adjustToContentHeight
        handlePosition="outside"
        onClosed={() => {
          dispatch({type: 'RESET'});
          signatureRef.current = undefined;
        }}
        closeOnOverlayTap
        panGestureEnabled>
        {modalContent}
      </Modalize>
    </TxContext.Provider>
  );
}

const styles = StyleSheet.create({
  infoContainer: {
    height: height * 0.3,
    paddingBottom: standardPadding * 2,
  },
  emptyState: {
    height: height * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultContainer: {
    flex: 1,
    height: height * 0.3,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: standardPadding * 2,
    marginBottom: standardPadding * 2,
  },
  buttonBlock: {flex: 1, marginLeft: standardPadding},
  buttonGroup: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modal: {},
  title: {
    padding: standardPadding * 2,
    marginBottom: standardPadding * 2,
    fontSize: 14,
  },
  icon: {
    width: 32,
    height: 32,
  },
  iconText: {
    width: 20,
    height: 20,
  },
  marker: {
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderWidth: 4,
  },
  notAuthorized: {
    height: height / 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notAuthorizedHack: {
    marginTop: -100,
    alignItems: 'center',
  },
  cameraBase: {
    overflow: 'hidden',
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default TxContextProvider;

type State =
  | {step: 'none' | 'signature' | 'submitting' | 'success'}
  | {
      step: 'preview';
      txPayload: SignerPayloadJSON;
      params: unknown[];
      title: string;
      description: string;
      partialFee: number;
    }
  | {step: 'payload'; txPayload: SignerPayloadJSON}
  | {step: 'error'; error: string};

const initialState: State = {step: 'none'};

type Action =
  | {type: 'RESET'}
  | {type: 'NEXT_STEP'}
  | {type: 'ERROR'; payload: string}
  | {
      type: 'PREVIEW';
      payload: {
        txPayload: SignerPayloadJSON;
        partialFee: number;
        params: unknown[];
        title: string;
        description: string;
      };
    };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RESET':
      return initialState;

    case 'ERROR':
      return {step: 'error', error: action.payload};

    case 'PREVIEW':
      return {step: 'preview', ...action.payload};

    case 'NEXT_STEP': {
      switch (state.step) {
        case 'preview':
          return {step: 'payload', txPayload: state.txPayload};
        case 'payload':
          return {step: 'signature'};
        case 'signature':
          return {step: 'submitting'};
        case 'submitting':
          return {step: 'success'};
      }
      break;
    }
  }
  return state;
}
