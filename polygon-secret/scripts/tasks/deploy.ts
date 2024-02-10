import { setDeploymentAddress } from '../../.deployment/deploymentManager'
import { task } from 'hardhat/config'
import { verifyAddress } from '../../utils/verifyAddress'
import dotenv from 'dotenv'
dotenv.config()

const GatewayContract = process.env.GATEWAY_CONTRACT || ''
const GasReceiverContract = process.env.GASRECEIVER_CONTRACT || ''
const ChainName = process.env.ChainName || ''

task('deploy', 'Deploy all contracts')
  .addFlag('verify', 'verify contracts on etherscan')
  .setAction(async (args, { ethers, network }) => {
    const { verify } = args
    console.log('Network:', network.name)

    let PolygonToSecretFactory = await ethers.getContractFactory('SendReceive')
    let sendreceive = await PolygonToSecretFactory.deploy(
      '0xC249632c2D40b9001FE907806902f63038B737Ab', // axelar gateway
      '0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6', // axelar gas service
      'Avalanche', // fuji chain name
    )

    console.log('SendReceive deployed to: ', sendreceive.address)

    const [deployer] = await ethers.getSigners()
    console.log('Using address: ', deployer.address)

    const balance = await ethers.provider.getBalance(deployer.address)
    console.log('Balance: ', ethers.utils.formatEther(balance))

    const PolygonToSecret = await ethers.getContractFactory('PolygonToSecret')
    const polygonToSecretArg: [string, string, string] = [
      GatewayContract,
      GasReceiverContract,
      ChainName,
    ]
    const polygonToSecret = await PolygonToSecret.deploy(...polygonToSecretArg)

    await polygonToSecret.deployed()

    if (verify) {
      await verifyAddress(polygonToSecret.address, polygonToSecretArg)
    }

    console.log('Deployed PolygonToSecret at', polygonToSecret.address)
    setDeploymentAddress(network.name, 'PolygonToSecret', polygonToSecret.address)
  })
