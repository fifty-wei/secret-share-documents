import { Wallet } from 'ethers'
import { task } from 'hardhat/config'

// https://hardhat.org/guides/create-task.html
//1. Create a new file in scripts/tasks/newtask.ts
//2. Add the following code to the file:
//3. import { task } from 'hardhat/config'
//4. run npx hardhat newtask --param "Hello World"

export const myparam = 'initial value'

task('newtask', 'Description of what newtask does')
  .addFlag('flag')
  .addOptionalParam('param', 'An optional parameter')
  .setAction(async (args, { ethers }) => {
    try {
      const { flag } = args
      // First task action
      console.log('My new task')

      // Get the param
      const [deployer] = await ethers.getSigners()

      const param = deployer || myparam
      console.log('Param: ', param)

      // Get the flag : run the command with npx hardhat newtask --flag
      if (flag) {
        console.log('Flag: ', flag)
      }
    } catch (error) {
      console.log('FAILED')
    }
  })
