const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { errorHandler } = require('./utils/errorsHandler')

const nftsRoutes = require('./routes/nfts.routes')
const marketplaceRoutes = require('./routes/marketplace.routes')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/api/nft', nftsRoutes)
app.use('/api/marketplace', marketplaceRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server corriendo el puerto: ${ PORT }`))