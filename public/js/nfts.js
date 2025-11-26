import { MyNftsCard } from "./utils/NftsCards.js";
import { getAccountNfts } from "./api/nftApi";

async function cargarMarketplace() {
    const nftList = document.getElementById('nft-list')

    nftList.innerHTML = "Cargando NFTs...";

    try {
        // const nfts = await getAllListings();
        const mynfts = await getAccountNfts()

        nftList.innerHTML = "";
        // if (!nfts.length) {
        //   nftList.textContent = "No hay NFTs listados todavía.";
        //   return;
        // }

        // nfts.forEach((nft, index) => addNftCard(nft, index));

        mynfts.forEach(nft => nftList.appendChild(MyNftsCard(nft)));
    } catch (err) {
        console.error(err);
        nftList.textContent = "Error al obtener NFTs.";
    }
}