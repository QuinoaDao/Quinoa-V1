import { expect } from "chai";
import { Result } from "@ethersproject/abi";
import { BigNumber, Contract, Signer } from "ethers";
import {ethers} from "hardhat";
import { 
    SwapExamples__factory,
    IERC20,
    IERC20__factory,
    IWETH__factory
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";


const routerAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
const DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"; // DAI on Matic
const WETH9 = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"; // WETH on MATIC
const WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; // WMATIC on MATIC


describe("Uniswap Swap Test", () => {
    let deployer : SignerWithAddress;
    let accounts;

    let swapExample: Contract;

    let dai: Contract;
    let weth: Contract
    let wmatic: Contract;

    beforeEach(async () => {
        [deployer, ...accounts] = await ethers.getSigners();
    })

    it("deploy SwapExample Contract", async () => {
        swapExample = await new SwapExamples__factory(deployer).deploy(routerAddress);
        await swapExample.deployed();
    })

    it("initial balance check", async () => {
        dai = await IERC20__factory.connect(DAI, deployer);
        weth = await IWETH__factory.connect(WETH9, deployer);
        wmatic = await IWETH__factory.connect(WMATIC, deployer);
        console.log("balance of ETH: ", await deployer.getBalance());
        console.log("balance of DAI: ", await dai.balanceOf(deployer.address))
        console.log("balance of weth: ", await weth.balanceOf(deployer.address))
        console.log("balance of wmatic: ", await wmatic.balanceOf(deployer.address))
    })

    it("get WMATIC with MATIC", async () => {
        const convertIntoWMATIC = await wmatic.deposit({ from: deployer.address, value: ethers.utils.parseEther("0.1"), gasLimit: 59999 });
        const txResponse = await convertIntoWMATIC.wait(); 
        console.log("balance of ETH: ", await deployer.getBalance());
        console.log("balance of DAI: ", await dai.balanceOf(deployer.address))
        console.log("balance of weth: ", await weth.balanceOf(deployer.address))
        console.log("balance of wmatic: ", await wmatic.balanceOf(deployer.address))
    })

    it("allow WMATIC", async () => {
        await wmatic.connect(deployer).approve(swapExample.address, ethers.utils.parseEther("0.1"), {gasLimit: 59999});
    })

    it("Single Swap", async () => {
        const swapTx = await swapExample.connect(deployer).swapExactInputSingle(ethers.utils.parseEther("0.1"),  wmatic.address, dai.address);
        await swapTx.wait();
        console.log("balance of ETH: ", await deployer.getBalance());
        console.log("balance of DAI: ", await dai.balanceOf(deployer.address))
        console.log("balance of weth: ", await weth.balanceOf(deployer.address))
        console.log("balance of wmatic: ", await wmatic.balanceOf(deployer.address))
    })

    


})

