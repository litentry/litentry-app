import React from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Divider} from '@ui-kitten/components';
import {useTips} from 'src/hook/useTips';
import {TipTeaser} from 'layout/tips/TipTeaser';
import {EmptyView} from 'presentational/EmptyView';
import globalStyles from 'src/styles';
import LoadingView from 'presentational/LoadingView';
import SafeView, {noTopEdges} from 'presentational/SafeView';

function TipsScreen() {
  const {data: tips, isLoading} = useTips();

  return (
    <SafeView edges={noTopEdges}>
      <View style={styles.container}>
        {isLoading ? (
          <LoadingView />
        ) : (
          <FlatList
            style={globalStyles.flex}
            data={tips}
            renderItem={({item}) => <TipTeaser tip={item} />}
            keyExtractor={(item) => item.toString()}
            ListEmptyComponent={EmptyView}
          />
        )}
      </View>
    </SafeView>
  );
}

export default TipsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
});
