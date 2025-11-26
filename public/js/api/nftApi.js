import { connectWallet } from "../web3/provider.js";

export async function getMetaData(name, description, image) {
    const data = new FormData();
    data.append('name', name);
    data.append('description', description);
    data.append('image', image)

    const response = await fetch('http://localhost:3000/api/nft/new', {
        method: 'POST',
        body: data
    });

    const imgUri = (await response.json())['tokenUri']
    return imgUri
}

export async function getAccountNfts() {
    const account = await connectWallet()
    const response = await fetch('http://localhost:3000/api/nft/account-nfts?account=' + account)
    return response.json()
}