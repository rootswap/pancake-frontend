import React, { useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import styled from 'styled-components'
import {
  Modal,
  Button,
  Flex,
  AutoRenewIcon,
  Heading,
  Text,
  Image,
  CrownIcon,
  TrophyGoldIcon,
  TeamPlayerIcon,
} from '@rootswap-libs/uikit'
import useI18n from 'hooks/useI18n'
import { useTradingCompetitionContract } from 'hooks/useContract'
import { useToast } from 'state/hooks'
import { useCompetitionCakeRewards, getRewardGroupAchievements } from '../../helpers'
import { CompetitionProps } from '../../types'
import NftBunnies from '../../pngs/syrup-nft.png'

const ImageWrapper = styled(Flex)`
  justify-content: center;
  width: 100%;
  height: fit-content;
  img {
    border-radius: ${({ theme }) => theme.radii.default};
  }
`

const ClaimModal: React.FC<CompetitionProps> = ({ onDismiss, onClaimSuccess, userTradingInformation }) => {
  const [isConfirming, setIsConfirming] = useState(false)
  const tradingCompetitionContract = useTradingCompetitionContract()
  const { account } = useWeb3React()
  const { toastSuccess, toastError } = useToast()
  const TranslateString = useI18n()

  const { userRewardGroup, userCakeRewards, userPointReward, canClaimNFT } = userTradingInformation
  const { cakeReward } = useCompetitionCakeRewards(userCakeRewards)
  const { champion, teamPlayer } = getRewardGroupAchievements(userRewardGroup)

  const handleClaimClick = () => {
    tradingCompetitionContract.methods
      .claimReward()
      .send({ from: account })
      .on('sending', () => {
        setIsConfirming(true)
      })
      .on('receipt', async () => {
        toastSuccess('You have claimed your rewards!')
        onDismiss()
        onClaimSuccess()
      })
      .on('error', (error) => {
        toastError('Error', error?.message)
        setIsConfirming(false)
      })
  }

  return (
    <Modal title={TranslateString(556, 'Collect Winnings')} onDismiss={onDismiss}>
      <Flex width="100%" flexDirection="column" alignItems="center" justifyContent="center" maxWidth="360px">
        <Text color="secondary" bold fontSize="16px">
          {TranslateString(999, 'Congratulations! You won')}:
        </Text>
        <Flex mt="16px" alignItems="center">
          {/* achievements */}
          <TrophyGoldIcon mr={[0, '4px']} />
          {champion && <CrownIcon mr={[0, '4px']} />}
          {teamPlayer && <TeamPlayerIcon mr={[0, '4px']} />}
          <Text ml={['4px', '8px']}>
            +{userPointReward} {TranslateString(999, 'Points')}
          </Text>
        </Flex>
        {/* cake */}
        <Heading mt="16px" size="md" mb={canClaimNFT ? '16px' : '0px'}>
          {cakeReward.toFixed(2)} CAKE
        </Heading>
        {/* NFT */}
        {canClaimNFT ? (
          <Flex alignItems="center" flexDirection="column" width="100%">
            <ImageWrapper>
              <Image src={NftBunnies} width={128} height={128} />
            </ImageWrapper>
            <Text mt="8px" fontSize="16px">
              {TranslateString(999, 'Collectible NFT')}
            </Text>
          </Flex>
        ) : null}
        <Button
          mt="24px"
          width="100%"
          onClick={handleClaimClick}
          disabled={isConfirming}
          isLoading={isConfirming}
          endIcon={isConfirming ? <AutoRenewIcon spin color="currentColor" /> : null}
        >
          {TranslateString(464, 'Confirm')}
        </Button>
        <Text mt="24px" fontSize="12px" color="textSubtle" textAlign="center">
          {TranslateString(999, 'All prizes will be sent directly to your wallet and user account.')}
        </Text>
      </Flex>
    </Modal>
  )
}

export default ClaimModal
