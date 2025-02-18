import React, { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { Modal, ModalBody, Text, Image, Button, BalanceInput, Flex } from '@rootswap-libs/uikit'
import { PoolIds, Ifo } from 'config/constants/types'
import { WalletIfoData, PublicIfoData } from 'hooks/ifo/types'
import useI18n from 'hooks/useI18n'
import { getBalanceNumber, formatNumber } from 'utils/formatBalance'
import { getAddress } from 'utils/addressHelpers'
import ApproveConfirmButtons from 'views/Profile/components/ApproveConfirmButtons'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { useERC20 } from 'hooks/useContract'

interface Props {
  poolId: PoolIds
  ifo: Ifo
  publicIfoData: PublicIfoData
  walletIfoData: WalletIfoData
  userCurrencyBalance: BigNumber
  onSuccess: (amount: BigNumber) => void
  onDismiss?: () => void
}

const multiplierValues = [0.1, 0.25, 0.5, 0.75, 1]

const ContributeModal: React.FC<Props> = ({
  poolId,
  ifo,
  publicIfoData,
  walletIfoData,
  userCurrencyBalance,
  onDismiss,
  onSuccess,
}) => {
  const publicPoolCharacteristics = publicIfoData[poolId]
  const userPoolCharacteristics = walletIfoData[poolId]

  const { currency } = ifo
  const { limitPerUserInLP } = publicPoolCharacteristics
  const { amountTokenCommittedInLP } = userPoolCharacteristics
  const { contract } = walletIfoData
  const [value, setValue] = useState('')
  const { account } = useWeb3React()
  const raisingTokenContract = useERC20(getAddress(currency.address))
  const TranslateString = useI18n()
  const valueWithTokenDecimals = new BigNumber(value).times(new BigNumber(10).pow(18))

  const {
    isApproving,
    isApproved,
    isConfirmed,
    isConfirming,
    handleApprove,
    handleConfirm,
  } = useApproveConfirmTransaction({
    onRequiresApproval: async () => {
      try {
        const response = await raisingTokenContract.methods.allowance(account, contract.options.address).call()
        const currentAllowance = new BigNumber(response)
        return currentAllowance.gt(0)
      } catch (error) {
        return false
      }
    },
    onApprove: () => {
      return raisingTokenContract.methods
        .approve(contract.options.address, ethers.constants.MaxUint256)
        .send({ from: account })
    },
    onConfirm: () => {
      return contract.methods
        .depositPool(valueWithTokenDecimals.toString(), poolId === PoolIds.poolBasic ? 0 : 1)
        .send({ from: account })
    },
    onSuccess: async () => {
      onDismiss()
      onSuccess(valueWithTokenDecimals)
    },
  })

  const maximumLpCommitable = (() => {
    if (limitPerUserInLP.isGreaterThan(0)) {
      return limitPerUserInLP.minus(amountTokenCommittedInLP).isLessThanOrEqualTo(userCurrencyBalance)
        ? limitPerUserInLP
        : userCurrencyBalance
    }
    return userCurrencyBalance
  })()

  return (
    <Modal title={`Contribute ${currency.symbol}`} onDismiss={onDismiss}>
      <ModalBody maxWidth="320px">
        {limitPerUserInLP.isGreaterThan(0) && (
          <Flex justifyContent="space-between" mb="16px">
            <Text>{TranslateString(999, 'Max. LP token entry')}</Text>
            <Text>{getBalanceNumber(limitPerUserInLP, currency.decimals)}</Text>
          </Flex>
        )}
        <Flex justifyContent="space-between" mb="8px">
          <Text>{TranslateString(999, 'Commit:')}</Text>
          <Flex flexGrow={1} justifyContent="flex-end">
            <Image
              src={`/images/farms/${currency.symbol.split(' ')[0].toLocaleLowerCase()}.svg`}
              width={24}
              height={24}
            />
            <Text>{currency.symbol}</Text>
          </Flex>
        </Flex>
        <BalanceInput
          value={value}
          currencyValue={publicIfoData.currencyPriceInUSD.times(value || 0).toFixed(2)}
          onChange={(e) => setValue(e.currentTarget.value)}
          isWarning={valueWithTokenDecimals.isGreaterThan(maximumLpCommitable)}
          mb="8px"
        />
        <Text color="textSubtle" textAlign="right" fontSize="12px" mb="16px">
          Balance: {formatNumber(getBalanceNumber(userCurrencyBalance, currency.decimals), 2, 5)}
        </Text>
        <Flex justifyContent="space-between" mb="16px">
          {multiplierValues.map((multiplierValue, index) => (
            <Button
              key={multiplierValue}
              scale="xs"
              variant="tertiary"
              onClick={() => setValue(getBalanceNumber(maximumLpCommitable.times(multiplierValue)).toString())}
              mr={index < multiplierValues.length - 1 ? '8px' : 0}
            >
              {TranslateString(999, `${multiplierValue * 100}%`)}
            </Button>
          ))}
        </Flex>
        <Text color="textSubtle" fontSize="12px" mb="24px">
          {TranslateString(
            999,
            'If you don’t commit enough LP tokens, you may not receive any IFO tokens at all and will only receive a full refund of your LP tokens.',
          )}
        </Text>
        <ApproveConfirmButtons
          isApproveDisabled={isConfirmed || isConfirming || isApproved}
          isApproving={isApproving}
          isConfirmDisabled={
            !isApproved || isConfirmed || valueWithTokenDecimals.isNaN() || valueWithTokenDecimals.eq(0)
          }
          isConfirming={isConfirming}
          onApprove={handleApprove}
          onConfirm={handleConfirm}
        />
      </ModalBody>
    </Modal>
  )
}

export default ContributeModal
