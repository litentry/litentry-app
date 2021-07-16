import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Layout} from '@ui-kitten/components';
import globalStyles from 'src/styles';
import Padder from 'presentational/Padder';
import SeactionTeaserContainer from 'presentational/SectionTeaserContainer';
import {useBlockTime} from 'src/api/hooks/useBlockTime';
import ProgressChartWidget from 'presentational/ProgressWidget';
import StatInfoBlock from 'presentational/StatInfoBlock';
import withTreasury, {InjectedPropTypes} from 'src/hoc/withTreasury';
import {formatNumber, BN_ONE, bnToBn, formatBalance, BN_ZERO} from '@polkadot/util';

type PropTypes = {
  onMorePress: () => void;
};

function TreasurySummaryTeaser(props: PropTypes & InjectedPropTypes) {
  const {treasuryInfo} = props;
  const total = treasuryInfo.spendPeriod || BN_ONE;
  const value = treasuryInfo.bestNumber?.mod(treasuryInfo.spendPeriod?.toBn() ?? BN_ONE);
  const angle = total.gtn(0)
    ? bnToBn(value || 0)
        .muln(36000)
        .div(total)
        .toNumber() / 100
    : 0;
  const percentage = Math.floor((angle * 100) / 360);

  const {timeStringParts} = useBlockTime(treasuryInfo.spendPeriod);
  const {timeStringParts: termLeft} = useBlockTime(total.sub(value || BN_ONE));

  return (
    <SeactionTeaserContainer onMorePress={props.onMorePress} title="Treasury">
      <View>
        <Layout style={styles.container}>
          <Card style={[styles.item, styles.left]}>
            <View style={globalStyles.spaceBetweenRowContainer}>
              <StatInfoBlock title="Proposals">{String(treasuryInfo.info?.proposals.length)}</StatInfoBlock>
              <StatInfoBlock title="Totals">{formatNumber(treasuryInfo.totalProposals)}</StatInfoBlock>
            </View>
            <Padder scale={1} />
            <StatInfoBlock title="Approved">{String(treasuryInfo.info?.approvals.length)}</StatInfoBlock>
          </Card>
          <Card style={[styles.item, styles.right, styles.center]} disabled>
            <ProgressChartWidget
              title={`Spend period s (${timeStringParts[0]})`}
              detail={`${percentage}%\n${termLeft[0]}${termLeft[1] ? `\n${termLeft[1]}` : ''}`}
              data={[percentage / 100]}
            />
          </Card>
        </Layout>
        <Padder scale={0.3} />
        <Card>
          <View style={globalStyles.spaceBetweenRowContainer}>
            <StatInfoBlock title="Available">{formatBalance(treasuryInfo.treasuryBalance?.freeBalance)}</StatInfoBlock>
            <StatInfoBlock title="Next Burn">{formatBalance(treasuryInfo.burn || BN_ZERO)}</StatInfoBlock>
          </View>
        </Card>
      </View>
    </SeactionTeaserContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
  },
  left: {
    marginRight: 2,
  },
  right: {
    marginLeft: 2,
  },
  center: {
    alignItems: 'center',
  },
});

export default withTreasury(TreasurySummaryTeaser);
