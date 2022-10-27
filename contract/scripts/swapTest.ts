const { expect } = require("chai");
import { Result } from "@ethersproject/abi";
import { BigNumber } from "ethers";
import {ethers} from "hardhat";
import { 
    SwapExamples__factory,
    IWETH__factory,
    IERC20__factory
} from "../typechain-types";

async function deployContract(){
    const [deployer, user] = await ethers.getSigners();

    const routerAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
    const DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"; // DAI on Matic
    const WETH9 = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"; // WETH on MATIC

    // #3. Deploy Router
    const swapExample = await new SwapExamples__factory(deployer).deploy(routerAddress);
    await swapExample.deployed();
    // console.log("hello")
    // console.log(await deployer.provider);

    const dai = await IERC20__factory.connect(DAI, deployer);
    const weth = await IWETH__factory.connect(WETH9, deployer);
    console.log("balance of ETH: ", await deployer.getBalance());
    console.log("balance of DAI: ", await dai.balanceOf(deployer.address))
    console.log("balance of weth: ", await weth.balanceOf(deployer.address))

    // const convertIntoWETH = await weth.deposit({ from: deployer.address, value: ethers.utils.parseEther("0.1"), gasLimit: 59999 });
    // console.log("tx: ", convertIntoWETH);
    // const txResponse = await convertIntoWETH.wait();
    // console.log("response ------- :", txResponse);
    await swapExample.connect(deployer).wrapEther({value : ethers.utils.parseEther("0.1"), gasLimit: 59999});
    console.log("balance of weth after: ", await weth.balanceOf(deployer.address))
    // await deployer.
}


async function main() {
    deployContract();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });