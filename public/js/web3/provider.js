export let provider = null
export let signer = null

export async function connectWallet() {
    if (!window.ethereum) {
        alert("Instala Metamask para continuar");
        return null;
    }

    if(!provider)
        provider = new ethers.providers.Web3Provider(window.ethereum);

    const accounts = await provider.send("eth_requestAccounts", []);

    if(!signer)
        signer = provider.getSigner();

    return accounts[0];
}

export async function ensureConnection() {
    if (!window.ethereum) {
        throw new Error("Metamask no está instalada");
    }

    if (!provider)
        provider = new ethers.providers.Web3Provider(window.ethereum);

    if (!signer) {
        const accounts = await provider.listAccounts();
        if (accounts.length === 0) {
            await provider.send("eth_requestAccounts", []);
        }
        signer = provider.getSigner();
    }

    return { provider, signer };
}