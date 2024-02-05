import hre from 'hardhat'
import { CONTRACT_NAMES, getDeployment } from '../../.deployment/deploymentManager'
import { loadJSON, saveJSON } from '../../utils/files'

const SUBGRAPH_FILE = `${process.env.SUBGRAPH_FOLDER}/networks.json`

async function main() {
  const network = hre.network.name

  const config = getDeployment(network)
  const subgraphNetwork = loadJSON(SUBGRAPH_FILE)

  for (const contractName of CONTRACT_NAMES) {
    subgraphNetwork[network][contractName].address = config[contractName]
  }

  saveJSON(SUBGRAPH_FILE, subgraphNetwork)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
