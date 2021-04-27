import { MenuEntry } from '@rootswap-libs/uikit'

const config: MenuEntry[] = [
  {
    label: 'Home',
    icon: 'HomeIcon',
    href: '/',
  },
  {
    label: 'Trade',
    icon: 'TradeIcon',
    items: [
      {
        label: 'Exchange',
        href: 'https://exchange.rootswap.finance',
      },
      {
        label: 'Liquidity',
        href: 'https://exchange.rootswap.finance/#/pool',
      },
    ],
  },
  {
    label: 'More',
    icon: 'MoreIcon',
    items: [
      {
        label: 'Contact',
        href: 'https://www.rootswap.com/contact-us',
      },
      {
        label: 'Github',
        href: 'https://github.com/rootswap',
      },
      {
        label: 'Docs',
        href: 'https://www.pancakeswap.com/docs',
      },
      {
        label: 'Blog',
        href: 'https://rootswap.medium.com',
      },
    ],
  },
]

export default config
