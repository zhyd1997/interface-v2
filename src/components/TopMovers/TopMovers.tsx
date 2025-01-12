import React, { useEffect, useMemo, useState } from 'react';
import { Box, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { ArrowDropUp, ArrowDropDown } from '@material-ui/icons';
import Skeleton from '@material-ui/lab/Skeleton';
import { Token, ChainId } from '@uniswap/sdk';
import { getAddress } from '@ethersproject/address';
import { CurrencyLogo } from 'components';
import { getEthPrice, getTopTokens, getPriceClass, formatNumber } from 'utils';
import 'components/styles/TopMovers.scss';

interface TopMoversProps {
  hideArrow?: boolean;
}
const TopMovers: React.FC<TopMoversProps> = ({ hideArrow = false }) => {
  const { breakpoints } = useTheme();
  const [topTokens, updateTopTokens] = useState<any[] | null>(null);
  const smallWindowSize = useMediaQuery(breakpoints.down('xs'));

  const topMoverTokens = useMemo(
    () => (topTokens && topTokens.length >= 5 ? topTokens.slice(0, 5) : null),
    [topTokens],
  );

  useEffect(() => {
    async function fetchTopTokens() {
      const [newPrice, oneDayPrice] = await getEthPrice();
      const topTokensData = await getTopTokens(newPrice, oneDayPrice, 5);
      if (topTokensData) {
        updateTopTokens(topTokensData);
      }
    }
    fetchTopTokens();
  }, [updateTopTokens]);

  return (
    <Box className='bg-palette topMoversWrapper'>
      <p className='weight-600 text-secondary'>24h TOP MOVERS</p>
      <Box className='topMoversContent'>
        {topMoverTokens ? (
          <Box>
            {topMoverTokens.map((token: any) => {
              const currency = new Token(
                ChainId.MATIC,
                getAddress(token.id),
                token.decimals,
              );
              const priceClass = getPriceClass(Number(token.priceChangeUSD));
              const priceUp = Number(token.priceChangeUSD) > 0;
              const priceDown = Number(token.priceChangeUSD) < 0;
              const priceUpPercent = Number(token.priceChangeUSD).toFixed(2);
              return (
                <Box className='topMoverItem' key={token.id}>
                  <CurrencyLogo currency={currency} size='28px' />
                  <Box ml={1}>
                    <small className='text-bold'>{token.symbol}</small>
                    <Box className='flex justify-center items-center'>
                      <small>${formatNumber(token.priceUSD)}</small>
                      <Box className={`topMoverText ${priceClass}`}>
                        {!hideArrow && priceUp && <ArrowDropUp />}
                        {!hideArrow && priceDown && <ArrowDropDown />}
                        <span>
                          {hideArrow && priceUp ? '+' : ''}
                          {priceUpPercent}%
                        </span>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Skeleton variant='rect' width='100%' height={100} />
        )}
      </Box>
    </Box>
  );
};

export default React.memo(TopMovers);
