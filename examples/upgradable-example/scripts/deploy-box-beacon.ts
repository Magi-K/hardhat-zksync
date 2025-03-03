import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { Wallet } from 'zksync-ethers';
import chalk from 'chalk';

import * as hre from 'hardhat';

async function main() {
    const contractName = 'Box';
    console.info(chalk.yellow(`Deploying ${contractName}...`));

    const testMnemonic = 'stuff slice staff easily soup parent arm payment cotton trade scatter struggle';
    const zkWallet = Wallet.fromMnemonic(testMnemonic);

    const deployer = new Deployer(hre, zkWallet);

    const boxContract = await deployer.loadArtifact(contractName);
    const beacon = await hre.zkUpgrades.deployBeacon(deployer.zkWallet, boxContract);
    await beacon.waitForDeployment();

    const box = await hre.zkUpgrades.deployBeaconProxy(deployer.zkWallet, await beacon.getAddress(), boxContract, [42]);
    await box.waitForDeployment();

    box.connect(zkWallet);
    const value = await box.retrieve();
    console.info(chalk.cyan('Box value is: ', value));

    const chainId = await hre.network.provider.send('eth_chainId', []);
    if (chainId === '0x12c') {
        const _ = hre.run('verify:verify', { address: await box.getAddress() });
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
