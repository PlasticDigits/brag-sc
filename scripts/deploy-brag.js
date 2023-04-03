const ether = require("@openzeppelin/test-helpers/src/ether");
const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const { ethers } = hre;
const { parseEther } = ethers.utils;

const DEPLOYER = "0x70e1cB759996a1527eD1801B169621C18a9f38F9";
const CZUSD = "0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70";
const ITERABLE_ARRAY = "0x4222FFCf286610476B7b5101d55E72436e4a6065";
const PCS_FACTORY = "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73";
const PCS_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const BASE_CZUSD_LOCKED = parseEther("7593.85");
const TOTAL_SUPPLY = parseEther("210000000");
const TEAM_ADDR = "0x36F912007cD1401F1E47Eed0f76208412B24D15e";

const INITIAL_CZUSD_LP_WAD = parseEther("11334.10");
const INITIAL_BRAG_LP_WAD = parseEther("140700000");


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const czusd = await ethers.getContractAt("CZUsd", CZUSD);
  const pcsRouter = await ethers.getContractAt("IAmmRouter02", PCS_ROUTER);
  /*const brag = await ethers.getContractAt("BRAG", "0x48c2bc3d0c63174B811aD4fa09b45cC039578aDb");*/
  const autoRewardPool = await ethers.getContractAt("AutoRewardPool", "0x5EdF8F1dEDD435b2c75ade5699d8315246565454");

  /*const AutoRewardPool = await ethers.getContractFactory("AutoRewardPool");
  const autoRewardPool = await AutoRewardPool.deploy();
  await autoRewardPool.deployed();
  console.log("autoRewardPool sc:", autoRewardPool.address);
  console.log("waiting 15 seconds...");
  await delay(15000);*/
  const Brag = await ethers.getContractFactory("BRAG");
  const brag = await Brag.deploy(CZUSD, PCS_ROUTER, PCS_FACTORY, autoRewardPool.address, BASE_CZUSD_LOCKED, TOTAL_SUPPLY, TEAM_ADDR)
  await brag.deployed();
  console.log("brag sc:", brag.address);
  console.log("waiting 15 seconds...");
  await delay(15000);

  console.log("initialize autoRewardPool..");
  const bragCzusdPair_address = await brag.ammCzusdPair();
  autoRewardPool.initialize(brag.address, bragCzusdPair_address);
  console.log("waiting 15 seconds...");
  await delay(15000);

  console.log("approve czusd for liq");
  await czusd.approve(PCS_ROUTER, ethers.constants.MaxUint256);
  console.log("waiting 15 seconds...");
  await delay(15000);
  console.log("approve brag for liq");
  await brag.approve(PCS_ROUTER, ethers.constants.MaxUint256);
  console.log("waiting 15 seconds...");
  await delay(15000);
  console.log("add liq");
  await pcsRouter.addLiquidity(
    czusd.address,
    brag.address,
    INITIAL_CZUSD_LP_WAD,
    INITIAL_BRAG_LP_WAD,
    0,
    0,
    brag.address,
    ethers.constants.MaxUint256
  );
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
