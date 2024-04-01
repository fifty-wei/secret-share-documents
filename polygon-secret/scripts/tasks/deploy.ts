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

    let PolygonToSecretFactory = await ethers.getContractFactory('PolygonToSecret')

    // deploy on Mumbai testnet only for the hardhat test
    //https://docs.axelar.dev/resources/contract-addresses/testnet
    // let polygonToSecretFactory = await PolygonToSecretFactory.deploy(
    //   '0xBF62ef1486468a6bd26Dd669C06db43dEd5B849B', // axelar gateway
    //   '0xbE406F0189A0B4cf3A05C286473D23791Dd44Cc6', // axelar gas service
    //   'Polygon', // mumbai chain name
    // )
    // console.log('polygonToSecret deployed to: ', polygonToSecretFactory.address)

    const [deployer] = await ethers.getSigners()
    console.log('Using address: ', deployer.address)

    const balance = await ethers.provider.getBalance(deployer.address)
    console.log('Balance: ', ethers.utils.formatEther(balance))

    console.log('Axelar GatewayContract :', GatewayContract)
    console.log('Axelar GasReceiverContract :', GasReceiverContract)
    console.log('Axelar ChainName :', ChainName)

    const PolygonToSecret = await ethers.getContractFactory('PolygonToSecret')
    const polygonToSecretArg: [string, string] = [GatewayContract, GasReceiverContract]
    const polygonToSecret = await PolygonToSecret.deploy(...polygonToSecretArg)

    await polygonToSecret.deployed()

    if (verify) {
      await verifyAddress(polygonToSecret.address, polygonToSecretArg)
    }

    console.log('Deployed PolygonToSecret at', polygonToSecret.address)
    setDeploymentAddress(network.name, 'PolygonToSecret', polygonToSecret.address)
  })
