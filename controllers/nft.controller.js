require('dotenv').config({path:require('find-config')('.env')})
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')
const ethers = require('ethers')

async function createImgInfo(imgRoute) {
    const stream = fs.createReadStream(imgRoute)
    const data = new FormData()

    data.append('file', stream)

    const fileResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        headers:{
            "Content-Type":`multipart/form-data: boundary=${data._boundary}`,
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

async function createNFT(imgRoute, name, description) {
    const imgInfo = await createImgInfo(imgRoute)

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

module.exports = {
    createNFT
}