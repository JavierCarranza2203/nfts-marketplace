const {  ethers } = require("hardhat")

const param = process.argv[2];

async function deployNFT() {
    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy()
    const txHash = nft.deployTransaction.hash;
    const txReceipt = await ethers.provider.waitForTransaction(txHash)
    console.log("Contract deployed address:",txReceipt.contractAddress)
}

async function deployWallet() {
    const owners = ["0x045a046325ff2FCf8BE3f1B77DC87626348C5e89","0x48464B82B4B3FA1E31C8De97D71C149CbC1D10B0"]
    const partes = ["70","30"]
    const requiredApprovals = 2;
    const multiSignWallet = await ethers.getContractFactory("MultiSignPaymentWallet");
    const wallet = await multiSignWallet.deploy(owners, requiredApprovals, owners, partes)
    console.log("ADDRESS:", wallet.address)
    console.log("OWNERS:", owners)
    console.log("GAS: ", ethers.utils.formatEther(wallet.deployTransaction.gasPrice))
}

async function deployMarketplace() {
    const walletContractAddress = "0xF6364aa903eB5AEc14ffdBF012d6b52D938ccc5b"
    const feeToSellNFt = 10

    marketplaceContract = await ethers.getContractFactory("NftsMarketplace")
    const  marketplace = await marketplaceContract.deploy(walletContractAddress, feeToSellNFt)

    console.log("ADDRESS:" + marketplace.address)
}

async function main() {
    switch(param) {
        case "wallet":
            return deployWallet();
        case "nft":
            return deployNFT();
        case "marketplace":
            return deployMarketplace();
        default:
            console.log("Parámetro inválido. Usa: wallet | nft | marketplace");
    }
}

main()