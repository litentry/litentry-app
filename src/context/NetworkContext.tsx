import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {noop} from 'lodash';
import {NetworkContextValueType, NetworkType} from 'src/types';
import {DataContext} from './DataContext';

const PolkadotNetwork = {
  name: 'Polkadot',
  ws: 'wss://rpc.polkadot.io',
  color: '#800000',
};

const KusamaNetwork = {
  name: 'Kusama',
  ws: 'wss://kusama-rpc.polkadot.io/',
  color: '#e6194B',
};

const WestendNetwork = {
  name: 'Westend (Test)',
  ws: 'wss://westend-rpc.polkadot.io/',
  color: '#fabed4',
};

const LitentryNetworkTest = {
  name: 'Litentry Testnet',
  ws: 'ws://13.229.136.206:9944',
  isTestnet: true,
  color: '#006400',
};

const availableNetworks = [
  PolkadotNetwork,
  KusamaNetwork,
  WestendNetwork,
  LitentryNetworkTest,
];

export const NetworkContext = createContext<NetworkContextValueType>({
  currentNetwork: PolkadotNetwork,
  availableNetworks: availableNetworks,
  select: noop,
});

type PropTypes = {
  children: React.ReactNode;
};

export default function NetworkContextProvider({children}: PropTypes) {
  const {asyncStorage} = useContext(DataContext);
  const [currentNetwork, setNetwork] = useState<NetworkType>();

  useEffect(() => {
    asyncStorage.get('network', availableNetworks[0]).then(setNetwork);
  }, [asyncStorage]);

  const select = useCallback(
    (network: NetworkType) => {
      setNetwork(network);
      asyncStorage.set('network', JSON.stringify(network));
    },
    [asyncStorage],
  );

  const value = useMemo(
    () => ({
      currentNetwork,
      availableNetworks,
      select,
    }),
    [currentNetwork, select],
  );

  if (!currentNetwork) {
    return null;
  }

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}