import fetch from 'node-fetch';

const swapParams = {
    fromTokenAddress: "0x9c2C5fd7b07E95EE044DDeba0E97a665F142394f", // 1inch
    toTokenAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",// DAI
    amount: '100000000000000000',
    fromAddress: process.env.PUBLIC_ADDRESS,
    slippage: 1,
    disableEstimate: false,
    allowPartialFill: false
}

const chainId = 137;
const apiBaseUrl = 'https://api.1inch.io/v4.0/' + chainId;

function apiRequestURL(methodName, queryParams) {
    return apiBaseUrl + methodName + '?' + (new URLSearchParams(queryParams)).toString();
}

function checkAllowance(tokenAddress, walletAddress) {
    return fetch(apiRequestURL('/approve/allowance', {tokenAddress, walletAddress}))
    .then(res => res.json())
    .then(res => res.allowance)
}

async function main() {
    const allowance = await checkAllowance(swapParams.fromTokenAddress, process.env.PUBLIC_ADDRESS_SEC);
    console.log(allowance);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });