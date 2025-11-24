// public/js/main.js
import { connectWallet, getAllListings, buy } from "./web3.js";

// Elementos del DOM
const btnConnect = document.getElementById("btn-connect");
const statusEl  = document.getElementById("status");
const nftList   = document.getElementById("nft-list");

console.log("main.js cargado", { btnConnect, statusEl, nftList });

// ========= Conectar Metamask =========
btnConnect?.addEventListener("click", async () => {
  if (!window.ethereum) {
    statusEl.textContent = "Instala Metamask para continuar";
    return;
  }

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
    const nfts = await getAllListings();

    nftList.innerHTML = "";
    if (!nfts.length) {
      nftList.textContent = "No hay NFTs listados todavía.";
      return;
    }

    nfts.forEach((nft, index) => addNftCard(nft, index));
  } catch (err) {
    console.error(err);
    nftList.textContent = "Error al obtener NFTs.";
  }
}

/**
 * Agrega una tarjeta NFT al contenedor.
 */
function addNftCard({ imageUrl, vendedor, descripcion, precio, enVenta }, index) {
  const card = document.createElement("article");
  card.className = "nft-card";

  card.innerHTML = `
    <img src="${imageUrl}" alt="NFT" />
    <div class="meta">
      <p class="descripcion">${descripcion}</p>
      <p class="vendedor ${enVenta ? "" : "hidden"}">
        Vendedor: <strong>${vendedor}</strong>
      </p>
      <p class="precio ${enVenta ? "" : "hidden"}">
        Precio: <strong>${precio} ETH</strong>
      </p>
    </div>
    <button class="btn-primary btn-accion">
      ${enVenta ? "Comprar" : "Poner en venta"}
    </button>
  `;

  const btnAccion = card.querySelector(".btn-accion");
  btnAccion.addEventListener("click", async () => {
    if (!enVenta) {
      alert("Por ahora solo implementamos la compra 😀");
      return;
    }

    try {
      await buy(index, precio);
      alert("Compra realizada!");
    } catch (err) {
      console.error(err);
      alert("Error al comprar NFT");
    }
  });

  nftList.appendChild(card);
}
