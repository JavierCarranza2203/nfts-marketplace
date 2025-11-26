import { MyNftsCard } from "./utils/NftsCards.js";
import { getAccountNfts } from "./api/nftApi.js";

async function cargarMarketplace() {
    const nftList = document.getElementById('nft-list')

    nftList.innerHTML = "Cargando NFTs...";

    try {
        const mynfts = await getAccountNfts()

        nftList.innerHTML = "";
        if (!mynfts.length) {
            nftList.textContent = "No hay NFTs listados todavía.";
            return;
        }

        mynfts.forEach(nft => nftList.appendChild(MyNftsCard(nft)));
    } catch (err) {
        console.error(err);
        nftList.textContent = "Error al obtener NFTs.";
    }
}

cargarMarketplace()