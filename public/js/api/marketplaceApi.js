import { CONTRACTS } from "../config/contracts.js"

export async function getNftsOnSale() {
    const result = await fetch('http://localhost:3000/api/marketplace/nfts-onsale')
    const response = await fetch('http://localhost:3000/api/nft/account-nfts?account=' + CONTRACTS.MARKETPLACE.address)
    const allnfts = await response.json()
    const data = await result.json()

    const nfts = data.map(nft => {
        const metadata = findMatch(allnfts, nft)

        return formatNfstInfo(
                nft.contract,
                nft.id,
                nft.price,
                nft.tokenId,
                nft.seller,
                metadata.image,
                metadata.description,
                metadata.name
            );
    })

    return nfts;
}

function findMatch(metadataList, marketplaceItem) {
    return metadataList.find(meta => {
        return(
            meta.contractAddress.toLowerCase() === marketplaceItem.contract.toLowerCase() &&
            meta.tokenId == marketplaceItem.tokenId
        )
    })
}

function formatNfstInfo(contract, id, price, tokenId, seller, image, description, name) {
    return {
        contract: contract,
        id: id,
        price: price,
        tokenId: tokenId,
        seller: seller,
        imageUrl: image,
        description: description,
        name: name
    }
}