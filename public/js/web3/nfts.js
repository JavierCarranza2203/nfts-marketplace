import { ensureContract } from './contract.js'
import { CONTRACTS } from "../config/contracts.js";

export async function mintNFT(_data) {
    const contract = await ensureContract(CONTRACTS.NFT.address, CONTRACTS.NFT.abi);

    try {
        // IMPORTANTE: el nombre de la función en tu contrato
        items = await contract.minNFTPaid(_data, {
            value: ethers.utils.parseEther("0.0000001"),
        });
    } catch (err) {
        console.warn("Error", err);
        return [];
    }
}