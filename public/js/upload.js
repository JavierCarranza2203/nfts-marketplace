import { getMetaData } from "./api/nftApi.js";
import { mintNFT } from "./web3/nfts.js";

const fileInput = document.getElementById("file");
const nombreInput = document.getElementById("nombre");
const descInput = document.getElementById("descripcion");
const btnUpload = document.getElementById("btn-upload");
const statusEl = document.getElementById("status");

btnUpload.addEventListener("click", async () => {
  statusEl.textContent = "Subiendo archivo...";

  const file = fileInput.files[0];
  if (!file) {
    statusEl.textContent = "Selecciona una imagen";
    return;
  }

  try {
    const imageUrl = await getMetaData(nombreInput.value, descInput.value, file)


    statusEl.textContent = "Guardando NFT en el contrato...";

    // 2️⃣ Mintear NFT con datos del formulario
    await mintNFT(imageUrl);

    statusEl.textContent = "NFT subido correctamente ✔️";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error al subir NFT ❌";
  }
});
