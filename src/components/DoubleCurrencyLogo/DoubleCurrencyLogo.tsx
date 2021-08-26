import { Currency } from '@uniswap/sdk';
import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { CurrencyLogo } from 'components';

const useStyles = makeStyles(({ palette, breakpoints }) => ({
  wrapper: {
    position: 'relative',
    display: 'flex',
    marginRight: (props: any) => props.margin && (props.size / 3 + 8),
    '& img:first-child': {
      zIndex: 2,
    },
    '& img:last-child': {
      position: 'absolute',
      left: (props: any) => `-${props.size / 2}px !important`
    }
  }
}));

interface DoubleCurrencyLogoProps {
  margin?: boolean
  size?: number
  currency0?: Currency
  currency1?: Currency
}

export default function DoubleCurrencyLogo({
  currency0,
  currency1,
  size = 16,
  margin = false
}: DoubleCurrencyLogoProps) {
  const classes = useStyles({ size, margin })
  return (
    <Box className={classes.wrapper}>
      {currency0 && <CurrencyLogo currency={currency0} size={size.toString() + 'px'} />}
      {currency1 && <CurrencyLogo currency={currency1} size={size.toString() + 'px'} />}
    </Box>
  )
}
