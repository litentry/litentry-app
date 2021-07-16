import {IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import BalanceContextProvider from 'context/BalanceContext';
import ChainApiContextProvider from 'context/ChainApiContext';
import TxContextProvider from 'context/TxContext';
import React from 'react';
import {Host} from 'react-native-portalize';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClient, QueryClientProvider} from 'react-query';
import {AccountsProvider} from 'src/context/AccountsContext';
import InAppNotificationContextProvider from 'src/context/InAppNotificationContext';
import NetworkContextProvider from 'src/context/NetworkContext';
import {ErrorBoundary} from 'src/ErrorBoundary';
import AppNavigator from 'src/navigation/AppNavigator';
// init type registry
import 'src/typeRegistry';
import ThemeProvider from './context/ThemeContext';
import {IonicIconsPack} from './Ionic-icons';

const queryClient = new QueryClient();

export default function App() {
  return (
    <>
      <IconRegistry icons={[EvaIconsPack, IonicIconsPack]} />
      <NetworkContextProvider>
        <ChainApiContextProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <InAppNotificationContextProvider>
                <SafeAreaProvider>
                  <ErrorBoundary>
                    <Host>
                      <AccountsProvider>
                        <BalanceContextProvider>
                          <TxContextProvider>
                            <AppNavigator />
                          </TxContextProvider>
                        </BalanceContextProvider>
                      </AccountsProvider>
                    </Host>
                  </ErrorBoundary>
                </SafeAreaProvider>
              </InAppNotificationContextProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </ChainApiContextProvider>
      </NetworkContextProvider>
    </>
  );
}
