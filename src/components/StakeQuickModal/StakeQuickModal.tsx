import React, { useState } from 'react';
import { Box, Button } from '@material-ui/core';
import { TransactionResponse } from '@ethersproject/providers';
import { CustomModal, ColoredSlider, NumericalInput } from 'components';
import { useDerivedLairInfo } from 'state/stake/hooks';
import { ReactComponent as CloseIcon } from 'assets/images/CloseIcon.svg';
import { useCurrencyBalance, useTokenBalance } from 'state/wallet/hooks';
import { useActiveWeb3React } from 'hooks';
import { GlobalConst } from 'constants/index';
import { useApproveCallback, ApprovalState } from 'hooks/useApproveCallback';
import { useLairContract } from 'hooks/useContract';
import {
  useTransactionAdder,
  useTransactionFinalizer,
} from 'state/transactions/hooks';
import { formatTokenAmount, returnTokenFromKey } from 'utils';
import 'components/styles/StakeModal.scss';

interface StakeQuickModalProps {
  open: boolean;
  onClose: () => void;
}

const StakeQuickModal: React.FC<StakeQuickModalProps> = ({ open, onClose }) => {
  const [attempting, setAttempting] = useState(false);
  const { account } = useActiveWeb3React();
  const addTransaction = useTransactionAdder();
  const finalizedTransaction = useTransactionFinalizer();
  const quickBalance = useCurrencyBalance(
    account ?? undefined,
    returnTokenFromKey('QUICK'),
  );
  const userLiquidityUnstaked = useTokenBalance(
    account ?? undefined,
    returnTokenFromKey('QUICK'),
  );

  const [typedValue, setTypedValue] = useState('');
  const [stakePercent, setStakePercent] = useState(0);
  const [approving, setApproving] = useState(false);
  const { parsedAmount, error } = useDerivedLairInfo(
    typedValue,
    returnTokenFromKey('QUICK'),
    userLiquidityUnstaked,
  );

  const lairContract = useLairContract();
  const [approval, approveCallback] = useApproveCallback(
    parsedAmount,
    GlobalConst.addresses.LAIR_ADDRESS,
  );

  const onAttemptToApprove = async () => {
    if (!lairContract) throw new Error('missing dependencies');
    const liquidityAmount = parsedAmount;
    if (!liquidityAmount) throw new Error('missing liquidity amount');
    return approveCallback();
  };

  const onStake = async () => {
    setAttempting(true);
    if (lairContract && parsedAmount) {
      if (approval === ApprovalState.APPROVED) {
        try {
          const response: TransactionResponse = await lairContract.enter(
            `0x${parsedAmount.raw.toString(16)}`,
            {
              gasLimit: 350000,
            },
          );
          addTransaction(response, {
            summary: `Stake QUICK`,
          });
          const receipt = await response.wait();
          finalizedTransaction(receipt, {
            summary: `Deposit dQUICK`,
          });
          setAttempting(false);
          setStakePercent(0);
          setTypedValue('');
        } catch (err) {
          setAttempting(false);
        }
      } else {
        setAttempting(false);
        throw new Error(
          'Attempting to stake without approval or a signature. Please contact support.',
        );
      }
    }
  };

  return (
    <CustomModal open={open} onClose={onClose}>
      <Box paddingX={3} paddingY={4}>
        <Box className='flex items-center justify-between'>
          <h5>Stake QUICK</h5>
          <CloseIcon className='cursor-pointer' onClick={onClose} />
        </Box>
        <Box
          mt={3}
          className='bg-default border-gray14'
          borderRadius='10px'
          padding='16px'
        >
          <Box className='flex items-center justify-between'>
            <small>QUICK</small>
            <small>Balance: {formatTokenAmount(quickBalance)}</small>
          </Box>
          <Box mt={2} className='flex items-center'>
            <NumericalInput
              placeholder='0'
              value={typedValue}
              fontSize={28}
              onUserInput={(value) => {
                const totalBalance = quickBalance
                  ? Number(quickBalance.toExact())
                  : 0;
                setTypedValue(value);
                setStakePercent(
                  totalBalance > 0 ? (Number(value) / totalBalance) * 100 : 0,
                );
              }}
            />
            <span
              className='text-primary text-bold cursor-pointer'
              onClick={() => {
                setTypedValue(quickBalance ? quickBalance.toExact() : '0');
                setStakePercent(100);
              }}
            >
              MAX
            </span>
          </Box>
          <Box className='flex items-center'>
            <Box flex={1} mr={2} mt={0.5}>
              <ColoredSlider
                min={1}
                max={100}
                step={1}
                value={stakePercent}
                handleChange={(evt: any, value) => {
                  setStakePercent(value as number);
                  setTypedValue(
                    quickBalance
                      ? stakePercent < 100
                        ? (
                            (Number(quickBalance.toExact()) * stakePercent) /
                            100
                          ).toString()
                        : quickBalance.toExact()
                      : '0',
                  );
                }}
              />
            </Box>
            <small>{Math.min(stakePercent, 100).toLocaleString()}%</small>
          </Box>
        </Box>
        <Box className='flex items-center justify-between'>
          <Box width='48%'>
            <Button
              className='stakeButton'
              disabled={approving || approval !== ApprovalState.NOT_APPROVED}
              onClick={async () => {
                setApproving(true);
                try {
                  await onAttemptToApprove();
                  setApproving(false);
                } catch (e) {
                  setApproving(false);
                }
              }}
            >
              {approving ? 'Approving...' : 'Approve'}
            </Button>
          </Box>
          <Box width='48%'>
            <Button
              className='stakeButton'
              disabled={
                !!error || attempting || approval !== ApprovalState.APPROVED
              }
              onClick={onStake}
            >
              {attempting ? 'Staking...' : 'Stake'}
            </Button>
          </Box>
        </Box>
      </Box>
    </CustomModal>
  );
};

export default StakeQuickModal;
