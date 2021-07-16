import React from 'react';
import {Host} from 'react-native-portalize';
import {IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import ThemeProvider from './context/ThemeContext';
import ChainApiContextProvider from 'context/ChainApiContext';
import {AccountsProvider} from 'src/context/AccountsContext';
import TxContextProvider from 'context/TxContext';
import AppNavigator from 'src/navigation/AppNavigator';
import {IonicIconsPack} from './Ionic-icons';
import {ErrorBoundary} from 'src/ErrorBoundary';
import {QueryClient, QueryClientProvider} from 'react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import NetworkContextProvider from 'src/context/NetworkContext';
import InAppNotificationContextProvider from 'src/context/InAppNotificationContext';

// init type registry
import 'src/typeRegistry';

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
                        <TxContextProvider>
                          <AppNavigator />
                        </TxContextProvider>
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
