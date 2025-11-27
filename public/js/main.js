// public/js/main.js
import { buy } from "./web3.js";
import { connectWallet } from './web3/provider.js'
import { getAccountNfts } from "./api/nftApi.js"
import { addNftCard, MyNftsCard } from "./utils/NftsCards.js";
import { getNftsOnSale } from "./api/marketplaceApi.js";

// Elementos del DOM
const btnConnect = document.getElementById("btn-connect");
const statusEl  = document.getElementById("status");
const nftList   = document.getElementById("nft-list");

// ========= Conectar Metamask =========
btnConnect?.addEventListener("click", async () => {
  try {
    const account = await connectWallet();
    if (!account) return;
    statusEl.textContent = `Conectado: ${account}`;

    // (Opcional) cargar NFTs del contrato
    await cargarMarketplace();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "No se pudo conectar a Metamask";
  }
});

// ========= Cargar NFTs del contrato =========
async function cargarMarketplace() {
  nftList.innerHTML = "Cargando NFTs...";

  try {
    const nfts = await getNftsOnSale();

    nftList.innerHTML = "";

    if (nfts.length <= 0) {
      nftList.textContent = "No hay NFTs listados todavía.";
      return;
    }

    // nfts.forEach((nft, index) => addNftCard(nft, index));

    nfts.forEach(nft => nftList.appendChild(addNftCard(nft)));
  } catch (err) {
    console.error(err);
    nftList.textContent = "Error al obtener NFTs.";
  }
}
