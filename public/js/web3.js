// public/js/web3.js
// Funciones para conectar Metamask y hablar con tu contrato NftsMarketplace

// Dirección del contrato Marketplace (la que tienes desplegada en Sepolia)
export const MARKETPLACE_ADDRESS = "0x2b0115000943da064faB429C6dE3d4a229A95431";

// Variables globales
let provider = null;
let signer = null;
let marketplace = null;
let marketplaceAbi = null;

// ===============================
//  Cargar ABI desde /contracts
// ===============================
async function loadAbi() {
  if (marketplaceAbi) return marketplaceAbi;

  const res = await fetch("/contracts/NftsMarketplace.json");
  if (!res.ok) {
    throw new Error("No se pudo cargar NftsMarketplace.json");
  }

  const json = await res.json();
  // Algunos builds tienen la ABI en json.abi, otros el json es solo la ABI
  marketplaceAbi = json.abi || json;
  return marketplaceAbi;
}

// ===============================
//  Asegurar provider / signer / contrato
// ===============================
async function ensureContract() {
  if (!window.ethereum) {
    throw new Error("Metamask no está instalada");
  }

  if (!provider) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
  }

  if (!signer) {
    // Si no hay cuentas, pide conexión
    const accounts = await provider.listAccounts();
    if (accounts.length === 0) {
      await provider.send("eth_requestAccounts", []);
    }
    signer = provider.getSigner();
  }

  if (!marketplace) {
    const abi = await loadAbi();
    marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, abi, signer);
  }

  return marketplace;
}

// ===============================
//  Conectar wallet (Metamask)
// ===============================
export async function connectWallet() {
  if (!window.ethereum) {
    alert("Instala Metamask para continuar");
    return null;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);

  // Pide permiso a Metamask
  const accounts = await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();

  const abi = await loadAbi();
  marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, abi, signer);

  // Devuelve la cuenta conectada
  return accounts[0];
}

// ===============================
//  Obtener NFTs en venta
// ===============================
export async function getAllListings() {
  try {
    const contract = await ensureContract();

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

    // items es un array de structs NtfProduct
    // struct NtfProduct {
    //   uint256 id;
    //   address nftContractAddress;
    //   uint256 tokenId;
    //   uint256 price;
    //   address payable seller;
    //   bool active;
    //   bool sold;
    // }

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

// ===============================
//  Comprar NFT
// ===============================
export async function buy(nftId, priceEth) {
  const contract = await ensureContract();

  const tx = await contract.BuyNFT(nftId, {
    value: ethers.utils.parseEther(priceEth.toString()),
  });

  await tx.wait();
  alert("Compra realizada con éxito 🚀");
  return tx.hash;
}

// ===============================
//  Stubs para upload.html
//  (ESTE contrato NO mintea ni guarda imagen)
// ===============================
export async function uploadToPinata(_file) {
  throw new Error(
    "uploadToPinata no está configurado. Este proyecto no tiene todavía las claves de Pinata."
  );
}

export async function mintNFT(_data) {
  throw new Error(
    "Este contrato NftsMarketplace no mintea NFTs; solo vende NFTs ya creados en otro contrato ERC721."
  );
}
