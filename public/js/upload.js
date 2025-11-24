import { uploadToPinata, mintNFT } from "./web3.js";

const fileInput = document.getElementById("file");
const nombreInput = document.getElementById("nombre");
const descInput = document.getElementById("descripcion");
const precioInput = document.getElementById("precio");
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
    // 1️⃣ Subir imagen a Pinata
    const imageUrl = await uploadToPinata(file);

    statusEl.textContent = "Guardando NFT en el contrato...";

    // 2️⃣ Mintear NFT con datos del formulario
    await mintNFT({
      nombre: nombreInput.value,
      descripcion: descInput.value,
      precio: precioInput.value,
      imageUrl
    });

    statusEl.textContent = "NFT subido correctamente ✔️";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error al subir NFT ❌";
  }
});
