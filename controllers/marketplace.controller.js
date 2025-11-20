require('dotenv').config({path:require('find-config')('.env')})
const { ethers } = require('ethers')
const contract = require('../artifacts/contracts/Marketplace.sol/NftsMarketplace.json')
const { getContract } = require('../utils/contractHelper')
const { MARKETPLACE_CONTRACT_ADDRESS } = process.env

async function getNFTsOnSale() {
    const marketplaceContract = await getContract(MARKETPLACE_CONTRACT_ADDRESS, contract.abi)
    const nfts = await marketplaceContract.GetNFTsOnSale()
    console.log(nfts)
    return nfts.map(formatNFT)
}

async function getNFTOnSale(nftProductId) {
    const marketplaceContract = await getContract(MARKETPLACE_CONTRACT_ADDRESS, contract.abi)
    const nft = await marketplaceContract.GetNFTOnSale(nftProductId)
    console.log(nft)
    return formatNFT(nft)
}

function formatNFT(data) {
    return {
        id: data[0],
        contract: data[1],
        tokenId: data[2],
        price: ethers.utils.formatEther(data[3]),
        seller: data[4]
    }
}

module.exports = {
    getNFTsOnSale,
    getNFTOnSale
}