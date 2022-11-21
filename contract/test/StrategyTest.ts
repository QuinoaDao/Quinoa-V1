import { expect } from "chai";
import { Result } from "@ethersproject/abi";
import { BigNumber, Contract, Signer } from "ethers";
import {ethers} from "hardhat";
import { 
    SwapExamples__factory,
    IERC20,
    IERC20__factory,
    IWETH__factory,
    StrategyBalancerWMaticStMatic__factory,
    Utils__factory,
    Router__factory,
    IBalancerVault,
    IBalancerVault__factory,
    TestToken__factory,
    Vault__factory,
} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const routerAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
const DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"; // DAI on Matic
const WETH9 = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"; // WETH on MATIC
const WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270"; // WMATIC on MATIC
const beefyVault = "0xF79BF908d0e6d8E7054375CD80dD33424B1980bf"
const poolId = "0x8159462d255c1d24915cb51ec361f700174cd99400000000000000000000075d";

describe("Balancer Strategy Test", async () => {
    let deployer : SignerWithAddress;
    let accounts : SignerWithAddress[];

    let vault: Contract;
    let dai: Contract;
    let weth: Contract
    let wmatic: Contract;
    let strategy : Contract;
    let dummyAddress :string;

    beforeEach(async () => {
        [deployer, ...accounts] = await ethers.getSigners();
        dummyAddress = accounts[5].address;
    })   
    
    it("deploy TestStrategy Contract", async () => {
        const Utils = await new Utils__factory(deployer).deploy();
        const utils = await Utils.deployed();
    
        const router = await new Router__factory(deployer).deploy(dummyAddress, dummyAddress, dummyAddress);
        await router.deployed();
    
        const VaultFactory = await ethers.getContractFactory("VaultFactory", {
            libraries: {
                Utils: utils.address
            }
        });
        const vaultFactory = await VaultFactory.connect(deployer).deploy(router.address, dummyAddress, dummyAddress);
        await vaultFactory.deployed();
        const tx = await vaultFactory.connect(accounts[0]).deployVault(
            ["MATIC", "MATICTT", "BEF", "#4D9AFF", "5.12"],     // vaultName/vaultSymbol/dacName/color/apy(apy는 그냥 임시로 param 넣어주는 것)
            WMATIC);
        const rc = await tx.wait();
        const event = rc.events?.find(event => event.event === 'VaultDeployed');
        const [vaultAddress, , , , ,]:Result= event?.args || [];


        strategy = await new StrategyBalancerWMaticStMatic__factory(deployer).deploy(WMATIC, vaultAddress, poolId, beefyVault);
        await strategy.deployed();
    })

    it("get wmatic", async () => {
        wmatic = await IWETH__factory.connect(WMATIC, deployer);
        console.log("BEFORE --balance of MATIC: ", await deployer.getBalance());
        console.log("BEFORE --balance of wmatic: ", await wmatic.balanceOf(deployer.address))
        const convertIntoWMATIC = await wmatic.deposit({ from: deployer.address, value: ethers.utils.parseEther("100"), gasLimit: 59999 });
        const txResponse = await convertIntoWMATIC.wait(); 
        console.log("AFTER --balance of MATIC: ", await deployer.getBalance());
        console.log("AFTER --balance of wmatic: ", await wmatic.balanceOf(deployer.address))
        await wmatic.connect(deployer).transfer(strategy.address, ethers.utils.parseEther("100"));
        console.log("AFTER --balance of wmatic : strategy", await wmatic.balanceOf(strategy.address));
    })

    it("prepare asset -- get wmatic", async ()=> {
        const lpToken0 = await strategy.lpTokens(0);
        const lpToken1 = await strategy.lpTokens(1);

        console.log("lpTokens ", lpToken0, " balance : ",await IERC20__factory.connect(lpToken0, deployer).balanceOf(strategy.address));
        console.log("lpTokens ", lpToken1, " balance : ", await IERC20__factory.connect(lpToken1, deployer).balanceOf(strategy.address));
        console.log("poolId: ", await strategy.poolId())
    })

    // TODO strategy have enough matic to call joinPool
    it("deposit to beefyVault", async () => {
        // const bal_stMatic_stable_pool = "0x8159462d255C1D24915CB51ec361F700174cD994"
        await strategy.deposit(10);
        const mintedBeefyToken = await IERC20__factory.connect('0xF79BF908d0e6d8E7054375CD80dD33424B1980bf', deployer)
        expect (await mintedBeefyToken.balanceOf(strategy.address)).to.not.equal(0);
        console.log(await mintedBeefyToken.balanceOf(strategy.address));
    })

    it("withdraw from beefyVault", async () => {
        await strategy.withdraw(10);
        // const mi
    })

})

