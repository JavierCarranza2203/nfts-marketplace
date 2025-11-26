const express = require('express')
const marketplaceController = require('../controllers/marketplace.controller')
const { errorCatcher } = require('../utils/errorsHandler')

const marketplaceRouter = express.Router()

marketplaceRouter.get('/nfts-onsale', errorCatcher(async (_ , res) => {
    const nfts = await marketplaceController.getNFTsOnSale()
    console.log(nfts)
    res.status(200).json(nfts)
}))

marketplaceRouter.get('/nft:nftId', errorCatcher(async (req, res) => {
    const { nftId } = req.params
    const nft = await marketplaceController.getNFTOnSale(nftId)

    res.status(200).json(nft)
}))

module.exports = marketplaceRouter