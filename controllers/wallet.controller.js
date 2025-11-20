require('dotenv').config({path:require('find-config')('.env')})
const { ethers } = require('ethers')
const contract = require('../artifacts/contracts/Wallet.sol/MultiSignPaymentWallet.json')
const { getContract } = require('../utils/contractHelper')
const { WALLET_CONTRACT_ADDRESS } = process.env

async function getBalance() {
    const walletContract = await getContract(WALLET_CONTRACT_ADDRESS,contract.abi)
    const balance = await walletContract.getBalance()
    return balance
}

async function getTransactions() {
    const walletContract = await getContract(WALLET_CONTRACT_ADDRESS,contract.abi)
    const transactions = await walletContract.getTransactions()
    return transactions.map(formatTransaction)
}

function formatTransaction(info) {
    return {
        id: info.id.toNumber(),
        to: info.to,
        amount: ethers.BigNumber.from(info.amount).toString(),
        approvalCount:ethers.BigNumber.from(info.approvalCount).toString(),
        executed:info.executed
    }
}

async function getApprovalsHistory(txId) {
    const walletContract = await getContract(WALLET_CONTRACT_ADDRESS, contract.abi);
    const tx = await walletContract.getApprovalsHistory(txId);

    return {
        txId: tx[0].toNumber(),
        totalApprovals: tx[1].toNumber(),
        approvals: tx[2].map(approver => ({
            approver: approver.approver,
            timestamp: approver.timestamp.toNumber(),
            date: new Date(approver.timestamp * 1000).toLocaleString()
        }))
    }
}

module.exports = {
    getBalance,
    getTransactions,
    getApprovalsHistory
}