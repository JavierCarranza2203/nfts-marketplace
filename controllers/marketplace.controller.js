require('dotenv').config({path:require('find-config')('.env')})
const { ethers } = require('ethers')
const contract = require('../artifacts/contracts/Marketplace.sol/NftsMarketplace.json')
const { getContract } = require('../utils/contractHelper')
const { MARKETPLACE_CONTRACT_ADDRESS } = process.env

async function getNFTsOnSale() {
    const marketplaceContract = await getContract(MARKETPLACE_CONTRACT_ADDRESS, contract.abi)
    const nfts = await marketplaceContract.GetNFTsOnSale()

    return nfts.map(formatNFT)
}

async function getNFTOnSale(nftProductId) {
    const marketplaceContract = await getContract(MARKETPLACE_CONTRACT_ADDRESS, contract.abi)
    const nft = await marketplaceContract.GetNFTOnSale(nftProductId)
    return formatNFT(nft)
}

function formatNFT(data) {
    return {
        id: ethers.BigNumber.from(data[0]).toNumber(),
        contract: data[1],
        tokenId: ethers.BigNumber.from(data[2]).toNumber(),
        price: ethers.utils.formatEther(data[3]),
        seller: data[4]
    }
}

module.exports = {
    getNFTsOnSale,
    getNFTOnSale
}