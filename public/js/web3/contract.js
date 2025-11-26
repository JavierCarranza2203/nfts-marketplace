import { ensureConnection } from "./provider.js";

export async function loadAbi(contract) {
    const res = await fetch("../../contracts/" + contract);
    if (!res.ok) {
        throw new Error("No se pudo cargar " + contract);
    }

    const json = await res.json();
    // Algunos builds tienen la ABI en json.abi, otros el json es solo la ABI
    return json.abi || json;
}

export async function ensureContract(address, abiFile) {
    const { signer } = await ensureConnection()

    const abi = await loadAbi(abiFile);
    const contract = new ethers.Contract(address, abi, signer);

    return contract;
}