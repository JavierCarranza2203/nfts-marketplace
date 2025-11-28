import { ensureContract } from "./contract.js";
import { CONTRACTS } from "../config/contracts.js";

export async function getAllListings() {
    try {
        const contract = await ensureContract(CONTRACTS.MARKETPLACE.address, CONTRACTS.MARKETPLACE.abi);

        let items;
        try {
            // IMPORTANTE: el nombre de la función en tu contrato
            items = await contract.GetNFTsOnSale();
        } catch (err) {
            console.warn("El contrato NO tiene GetNFTsOnSale(), regreso [].", err);
            return [];
        }

        if (!Array.isArray(items) || items.length === 0) {
            return [];
        }

        const nfts = items
        .filter((n) => n.active && !n.sold)
        .map((n) => {
            const id = n.id.toString();
            const tokenId = n.tokenId.toString();
            const priceEth = ethers.utils.formatEther(n.price);

            return {
                id,
                imageUrl: `https://placehold.co/400x400/png?text=NFT+${tokenId}`,
                vendedor: n.seller,
                descripcion: `Token ${tokenId} del contrato ${n.nftContractAddress}`,
                precio: priceEth,
                enVenta: n.active && !n.sold,
            };
        });

        return nfts;
    } catch (err) {
        console.error("Error al obtener NFTs:", err);
        return [];
    }
}

export async function postNftToSell(contractAddress, tokenId, price) {
    const contract = await ensureContract(CONTRACTS.MARKETPLACE.address, CONTRACTS.MARKETPLACE.abi);

    try {
        const weiPrice = ethers.utils.parseEther(price); 
        const tx = await contract.PostNFTToSell(contractAddress, tokenId, weiPrice);
        tx.wait()
    }
    catch(error) {
        console.warn("Error", error);
        return {
            success: false,
            error: error.message
        }
    }
}
