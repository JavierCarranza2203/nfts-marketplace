// public/js/web3.js
// Funciones para conectar Metamask y hablar con tu contrato NftsMarketplace


// Variables globales
let provider = null;
let signer = null;


// ===============================
//  Comprar NFT
// ===============================
export async function buy(nftId, priceEth) {
  const contract = await ensureContract(MARKETPLACE_ADDRESS, MARKETPLACE_CONTRACT_ABI);

  const tx = await contract.BuyNFT(nftId, {
    value: ethers.utils.parseEther(priceEth.toString()),
  });

  await tx.wait();
  alert("Compra realizada con éxito 🚀");
  return tx.hash;
}