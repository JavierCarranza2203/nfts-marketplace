require('dotenv').config({path:require('find-config')('.env')})
const FormData = require('form-data')
const axios = require('axios')
const { Readable } = require('stream');
const { PINATA_API_KEY, PINATA_SECRET_KEY, API_URL } = process.env

async function createImgInfo(img) {
    const stream = Readable.from(img.buffer);
    const data = new FormData();

    data.append("file", stream, {
        filename: img.originalname,
        contentType: img.mimetype
    });

    const fileResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        headers:{
            ...data.getHeaders(),
            pinata_api_key:PINATA_API_KEY,
            pinata_secret_api_key:PINATA_SECRET_KEY
        }
    })

    const { data:fileData = {} } = fileResponse
    const { IpfsHash } = fileData
    const fileIpfs = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`

    return fileIpfs;
}

async function createJsonInfo(metadata) {
    const pinataJsonBody = {
        pinataMetadata: {
            name: metadata.name
        },
        pinataContent: metadata
    }

    const jsonResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS', pinataJsonBody, {
            headers:{
                "Content-Type":'application/json',
                pinata_api_key:PINATA_API_KEY,
                pinata_secret_api_key:PINATA_SECRET_KEY
            }
        }
    )

    const { data:jsonData  = {}} = jsonResponse
    const { IpfsHash } = jsonData
    const tokenURI = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`

    return tokenURI
}

async function createNFT(img, name, description) {
    const imgInfo = await createImgInfo(img)

    const metadata = {
        image: imgInfo,
        name: name,
        description: description,
        attributes: [
            { 'trait_type': 'color', value: 'white' },
            { 'trait_type': 'background', value: 'white' }
        ]
    }

    const tokenURI = await createJsonInfo(metadata);

    return tokenURI;
}

async function getAccountNfts(account) {
    const response = await fetch(API_URL + "/getNFTs/?owner=" + account)

    const data = await response.json();

    const nfts = data["ownedNfts"]

    return nfts.map(parseNFTData)
}

function parseNFTData(nft) {
    return {
        contractAddress: nft.contract.address,
        tokenId: parseInt(nft.id.tokenId, 16), // hex → entero
        name: nft.title || nft.metadata?.name,
        description: nft.description || nft.metadata?.description,
        image: nft.media?.[0]?.raw || nft.metadata?.image
    };
}


module.exports = {
    createNFT,
    getAccountNfts
}