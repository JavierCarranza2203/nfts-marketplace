import { CONTRACTS } from "../config/contracts.js";
import { ensureContract } from "../web3/contract.js";
import { postNftToSell } from "../web3/marketplace.js";

function createCard({ image, description, name, contractAddress, tokenId, vendedor, precio, enVenta, btnText, onClick }) {
    const card = document.createElement("article");
    card.className = "nft-card";

    // Imagen
    const img = document.createElement("img");
    img.src = image;
    img.alt = "NFT";
    card.appendChild(img);

    // Contenedor meta
    const meta = document.createElement("div");
    meta.className = "meta";

    if (description) {
        const desc = document.createElement("p");
        desc.className = "descripcion";
        desc.textContent = description;
        meta.appendChild(desc);
    }

    if (name) {
        const title = document.createElement("p");
        title.className = "titulo";
        title.textContent = name;
        meta.appendChild(title);
    }

    if (contractAddress) {
        const contrato = document.createElement("p");
        contrato.className = "contrato";
        contrato.innerHTML = `Contrato: <strong>${contractAddress}</strong>`;
        meta.appendChild(contrato);
    }

    if (tokenId !== undefined) {
        const id = document.createElement("p");
        id.className = "token-id";
        id.innerHTML = `Token ID: <strong>${tokenId}</strong>`;
        meta.appendChild(id);
    }

    if (vendedor) {
        const vend = document.createElement("p");
        vend.className = `vendedor ${enVenta ? "" : "hidden"}`;
        vend.innerHTML = `Vendedor: <strong>${vendedor}</strong>`;
        meta.appendChild(vend);
    }

    if (precio !== undefined) {
        const price = document.createElement("p");
        price.className = `precio ${enVenta ? "" : "hidden"}`;
        price.innerHTML = `Precio: <strong>${precio} ETH</strong>`;
        meta.appendChild(price);
    }

    card.appendChild(meta);

    // Botón
    const btn = document.createElement("button");
    btn.className = "btn-primary btn-accion";
    btn.textContent = btnText;
    if (onClick) btn.addEventListener("click", async () => await onClick());
    card.appendChild(btn);

    return card;
}

// =====================
// Mis NFTs
// =====================
export function MyNftsCard({ image, description, name, contractAddress, tokenId }) {
    const onClick = async () => {
        const nft = await ensureContract(contractAddress, CONTRACTS.NFT.abi);
        const tx = await nft.approve(CONTRACTS.MARKETPLACE.address, String(tokenId));

        Swal.fire({
            title: 'Esperando aprobación de contrato',
            timerProgressBar: true,
            theme: 'dark',
            backdrop: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        await tx.wait()

        const { value: precio } = await Swal.fire({
            title: "Precio de venta",
            input: "text",
            inputLabel: "Ingresa el precio para este NFT",
            inputPlaceholder: "0.05 ETH",
            showCancelButton: true,
            confirmButtonText: "Aceptar",
            cancelButtonText: "Cancelar",
            theme: 'dark'
        });

        if(precio) {
            await postNftToSell(contractAddress, tokenId, precio)

            Swal.fire({
                title: "El NFT se ha puesto en venta",
                icon: "success",
                theme: 'dark'
            });
        }
    }


    return createCard({
        image,
        description,
        name,
        contractAddress,
        tokenId,
        btnText: "Poner en venta",
        onClick
    });
}

// =====================
// Marketplace
// =====================
export function addNftCard({ imageUrl, descripcion, seller, price, name, contract, id }) {
    const onClick = async ()=> {
        const nft = await ensureContract(CONTRACTS.MARKETPLACE.address, CONTRACTS.MARKETPLACE.abi)
        const tx = await nft.BuyNFT(id, {
            value: ethers.utils.parseEther(price)

        })

        Swal.fire({
            title: 'Vendiendo...',
            timerProgressBar: true,
            theme: 'dark',
            backdrop: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        await tx.wait()

        Swal.fire({
                title: "El NFT se ha transferido a tu cuenta",
                icon: "success",
                theme: 'dark'
            });
    }
    
    const card = createCard({
        image: imageUrl,
        description: descripcion,
        vendedor: seller,
        precio: price,
        btnText: "Comprar",
        name,
        onClick
    });

    return card
}