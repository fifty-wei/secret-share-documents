import { HardhatUserConfig } from 'hardhat/config'
import 'hardhat-contract-sizer'
import '@nomicfoundation/hardhat-toolbox'
import './scripts/tasks/deploy'
import './scripts/tasks/newtask'
import dotenv from 'dotenv'

dotenv.config()
const mnemonic = process.env.MNEMONIC

if (!mnemonic) {
  throw new Error('Please set your MNEMONIC in a .env file')
}

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY
if (!infuraApiKey) {
  throw new Error('Please set your INFURA_API_KEY in a .env file')
}

const accounts = {
  mnemonic,
  count: 100,
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic,
        count: 100,
      },
      chainId: 1337,
    },
    mumbai: {
      url: 'https://polygon-mumbai.infura.io/v3/' + infuraApiKey,
      accounts,
      chainId: 80001,
    },
    polygon: {
      url: 'https://polygon-mainnet.infura.io/v3/' + infuraApiKey,
      accounts,
      chainId: 137,
    },
    sepolia: {
      url: 'https://sepolia.infura.io/v3/' + infuraApiKey,
      accounts,
      chainId: 1337,
    },
    chiado: {
      url: 'https://rpc.chiadochain.net',
      gasPrice: 1000000000,
      accounts,
    },
    gnosis: {
      url: 'https://rpc.gnosischain.com',
      accounts,
    },
  },
  etherscan: {
    customChains: [
      {
        network: 'chiado',
        chainId: 10200,
        urls: {
          //Blockscout
          apiURL: 'https://blockscout.com/gnosis/chiado/api',
          browserURL: 'https://blockscout.com/gnosis/chiado',
        },
      },
      {
        network: 'gnosis',
        chainId: 100,
        urls: {
          // 3) Select to what explorer verify the contracts
          // Gnosisscan
          apiURL: 'https://api.gnosisscan.io/api',
          browserURL: 'https://gnosisscan.io/',
          // Blockscout
          //apiURL: "https://blockscout.com/xdai/mainnet/api",
          //browserURL: "https://blockscout.com/xdai/mainnet",
        },
      },
    ],
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || '',
      polygon: process.env.POLYGONSCAN_API_KEY || '',
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    only: ['PolygonToSecret'],
  },
}

export default config
