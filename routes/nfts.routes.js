const express = require('express')
const multer = require('multer');
const nftsController = require('../controllers/nft.controller')
const { errorCatcher } = require('../utils/errorsHandler');
const { getAccountNfts } = require('../controllers/nft.controller');

const nftsRouter = express.Router();
const upload = multer();

nftsRouter.post('/new', upload.single('image'), async (req, res) => {
    const { name, description } = req.body
    const image = req.file
    const tokenURI = await nftsController.createNFT(image, name, description)
    res.status(200).json({ tokenUri: tokenURI })
});

nftsRouter.get('/account-nfts', async(req, res)=>{
    const { account } = req.query

    const nfts = await getAccountNfts(account)

    res.status(200).json(nfts);
});

module.exports = nftsRouter