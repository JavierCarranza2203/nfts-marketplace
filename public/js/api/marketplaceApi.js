export async function getNftsOnSale() {
    const result = await fetch('http://localhost:3000/api/marketplace/nfts-onsale')

    const data = await result.json()
    console.log(data)
    return [];
}