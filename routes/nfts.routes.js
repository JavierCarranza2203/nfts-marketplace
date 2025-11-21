const express = require('express')
const multer = require('multer');
const nftsController = require('../controllers/nft.controller')
const { errorCatcher } = require('../utils/errorsHandler')

const nftsRouter = express.Router();
const upload = multer();

nftsRouter.post('/new', upload.single('image'), errorCatcher(async (req, res) => {
    const { name, description } = req.body
    const image = req.file.path

    const tokenURI = await nftsController.createNFT(image, name, description)

    res.status(200).json({ tokenUri: tokenURI })
}));

module.exports = nftsRouter