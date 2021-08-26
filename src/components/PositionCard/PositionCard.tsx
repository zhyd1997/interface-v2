import { JSBI, Pair, Percent } from '@uniswap/sdk';
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { Link } from 'react-router-dom';
import { useTotalSupply } from 'data/TotalSupply';
import { useActiveWeb3React } from 'hooks';
import { useTokenBalance } from 'state/wallet/hooks';
import { currencyId } from 'utils';
import { unwrappedToken } from 'utils/wrappedCurrency';
import { useColor } from 'hooks/useColor';
import { CurrencyLogo, DoubleCurrencyLogo } from 'components';
import { Box, Typography, Button } from '@material-ui/core';

interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
}

export const MinimalPositionCard: React.FC<PositionCardProps> = ({ pair, showUnwrapped = false, border }) => {
  const { account } = useActiveWeb3React()

  const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <>
      {userPoolBalance && JSBI.greaterThan(userPoolBalance.raw, JSBI.BigInt(0)) ? (
        <Box>
          <Box>
            <Box>
              <Box>
                <Typography>
                  Your position
                </Typography>
              </Box>
            </Box>
            <Box onClick={() => setShowMore(!showMore)}>
              <Box>
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
                <Typography>
                  {currency0.symbol}/{currency1.symbol}
                </Typography>
              </Box>
              <Box>
                <Typography>
                  {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Box>
                <Typography>
                  Your pool share:
                </Typography>
                <Typography>
                  {poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'}
                </Typography>
              </Box>
              <Box>
                <Typography>
                  {currency0.symbol}:
                </Typography>
                {token0Deposited ? (
                  <Typography>
                    {token0Deposited?.toSignificant(6)}
                  </Typography>
                ) : (
                  '-'
                )}
              </Box>
              <Box>
                <Typography>
                  {currency1.symbol}:
                </Typography>
                {token1Deposited ? (
                  <Typography>
                    {token1Deposited?.toSignificant(6)}
                  </Typography>
                ) : (
                  '-'
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography>
          <span role="img" aria-label="wizard-icon">
            ⭐️
          </span>{' '}
          By adding liquidity you&apos;ll earn 0.25% of all trades on this pair proportional to your share of the pool.
          Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
        </Typography>
      )}
    </>
  )
}

export default function FullPositionCard({ pair, border }: PositionCardProps) {
  const { account } = useActiveWeb3React()

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  return (
    <Box>
      <Box>
        <Box>
          <DoubleCurrencyLogo currency0={currency0} currency1={currency1} margin={true} size={20} />
          <Typography>
            {!currency0 || !currency1 ? <Typography>Loading</Typography> : `${currency0.symbol}/${currency1.symbol}`}
          </Typography>
        </Box>

        <Button onClick={() => setShowMore(!showMore)}>
          {showMore ? (
            <>
              {' '}
              Manage
              <ChevronUp size="20" style={{ marginLeft: '10px' }} />
            </>
          ) : (
            <>
              Manage
              <ChevronDown size="20" style={{ marginLeft: '10px' }} />
            </>
          )}
        </Button>
      </Box>

      {showMore && (
        <Box>
          <Box>
            <Typography>
              Your pool tokens:
            </Typography>
            <Typography>
              {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
            </Typography>
          </Box>
          <Box>
            <Typography>
              Pooled {currency0.symbol}:
            </Typography>
            {token0Deposited ? (
              <Box>
                <Typography>
                  {token0Deposited?.toSignificant(6)}
                </Typography>
                <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency0} />
              </Box>
            ) : (
              '-'
            )}
          </Box>

          <Box>
            <Typography>
              Pooled {currency1.symbol}:
            </Typography>
            {token1Deposited ? (
              <Box>
                <Typography>
                  {token1Deposited?.toSignificant(6)}
                </Typography>
                <CurrencyLogo size="20px" style={{ marginLeft: '8px' }} currency={currency1} />
              </Box>
            ) : (
              '-'
            )}
          </Box>

          <Box>
            <Typography>
              Your pool share:
            </Typography>
            <Typography>
              {poolTokenPercentage ? poolTokenPercentage.toFixed(2) + '%' : '-'}
            </Typography>
          </Box>

          <Button>
            <a style={{ width: '100%', textAlign: 'center' }} href={`https://info.quickswap.exchange/account/${account}`} target='_blank' rel='noreferrer'>
              View accrued fees and analytics<span style={{ fontSize: '11px' }}>↗</span>
            </a>
          </Button>
          <Box display='flex'>
            <Box width='48%'>
              <Link to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}>
                Add
              </Link>
            </Box>
            <Box width='48%'>
              <Link to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}>
                Remove
              </Link>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
