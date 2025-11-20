require('dotenv').config({path:require('find-config')('.env')})
const { ethers } = require('ethers')
const { provider, getWallet, getPublicKey } = require('./accountManager')

async function createTransaction(contractAddress, abi, method, params, account) {
    const ethersInterface = new ethers.utils.Interface(abi)
    const wallet = getWallet(account)
    const publickeys = getPublicKey(account)
    const nonce = await provider.getTransactionCount(publickeys, 'latest')
    const gasPrice = await provider.getGasPrice()
    const network = await provider.getNetwork()
    const tx = {
        from: publickeys,
        to: contractAddress,
        nonce: nonce,
        gasPrice,
        chainId: network.chainId,
        data: ethersInterface.encodeFunctionData(method, params)
    }
    console.log(tx)
    tx.gasLimit = await provider.estimateGas(tx)
    const signTx =await wallet.signTransaction(tx)
    const receipt = await provider.sendTransaction(signTx)
    await receipt.wait()
    console.log(`TX ${ method } sent:`, receipt.hash)
    return receipt
}

async function depositToContract(contractAddress, abi, mount, account) {
    const wallet = getWallet(account)
    const contract = new ethers.Contract(contractAddress, abi, wallet)
    const tx = await contract.deposit({ value: ethers.utils.parseEther(mount) })
    await tx.wait()
    console.log("Deposit Done: ", tx.hash)
    return tx
}

async function getContract(contractAddress, abi) {
    return new ethers.Contract(contractAddress, abi, provider);
}

async function getWriteContract(contractAddress, abi, account) {
    const wallet = getWallet(account)
    return new ethers.Contract(contractAddress, abi, wallet)

}


module.exports = {
    createTransaction,
    depositToContract,
    getContract,
    getWriteContract
}