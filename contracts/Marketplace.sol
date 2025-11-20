// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NftsMarketplace is ReentrancyGuard, Ownable {
    struct NtfProduct {
        uint256 id;
        address nftContractAddress;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool active;
        bool sold;
    }

    uint256 public nextNftProductId;
    mapping(uint => NtfProduct) public NftsProductsList;

    uint256 public totalNFTsReadyToSell;

    uint256 public feeToSellNFT;
    address public walletContractAddress;

    uint256 public pendingFeesToTransferToWallet;
    mapping(address => uint256) public pendingSellerPayments;

    event NFTPosted(uint256 indexed postedId, address indexed seller, address indexed nftContractAddress, uint256 tokenId, uint256 price);
    event NFTBought(uint256 indexed postedId, address indexed buyer, uint256 price, uint256 feeForSelling);
    event PostingCancelled(uint256 indexed postedId, address indexed seller);
    event WalletContractAddresUpdated(address indexed oldWalletContractAddress, address indexed newWalletContractAddress);
    event feeToSellNFTUpdated(uint256 oldFee, uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);

    constructor(address _walletContractAddress, uint256 _feeToSellNFT) {
        require(_walletContractAddress != address(0), "Wallet invalida");
        require(_feeToSellNFT > 0 && _feeToSellNFT <= 10, "La tarifa cobrada debe ser menor al 10%");

        walletContractAddress = _walletContractAddress;
        feeToSellNFT = _feeToSellNFT * 100;
    }

    function PostNFTToSell(address _nftContractAddress, uint256 _tokenId, uint256 _price) external nonReentrant {
        require(_price > 0, "El precio debe ser mayor a 0");
        require(_nftContractAddress != address(0), "Contrato de NFT invalido");

        IERC721 nftContract = IERC721(_nftContractAddress);

        require(nftContract.ownerOf(_tokenId) == msg.sender, "El NFT no es de tu propiedad");

        nftContract.transferFrom(msg.sender, address(this), _tokenId);

        uint nftProductId = nextNftProductId++;

        NftsProductsList[nftProductId] = NtfProduct({
            id: nftProductId,
            nftContractAddress: _nftContractAddress,
            tokenId: _tokenId,
            price: _price,
            seller: payable(msg.sender),
            active: true,
            sold: false
        });

        totalNFTsReadyToSell++;

        emit NFTPosted(nftProductId, msg.sender, _nftContractAddress, _tokenId, _price);
    }

    function BuyNFT(uint256 postedId) external payable nonReentrant {
        NtfProduct storage nftProduct = NftsProductsList[postedId];

        require(nftProduct.active, "El NFT no esta activo");
        require(!nftProduct.sold, "El NFT ya fue vendido");
        require(msg.value == nftProduct.price, "El precio a pagar no coincide. Revisa que sea la cantidad adecuada");

        nftProduct.active = false;
        nftProduct.sold = true;

        uint256 fee = (nftProduct.price * feeToSellNFT) / 10000;
        uint256 sellerAmount = nftProduct.price - fee;

        if(fee > 0) {
            (bool sentToWallet, ) = payable(walletContractAddress).call{ value: fee }("");
            if(!sentToWallet) {
                pendingFeesToTransferToWallet += fee;
            }
        }

        (bool sentToSeller, ) = nftProduct.seller.call{ value: sellerAmount }("");
        if(!sentToSeller) {
            pendingSellerPayments[nftProduct.seller] += sellerAmount;
        }

        IERC721(nftProduct.nftContractAddress).safeTransferFrom(address(this), msg.sender, nftProduct.tokenId);

        totalNFTsReadyToSell--;

        emit NFTBought(nftProduct.id, msg.sender, nftProduct.price, fee);
    }

    function GetNFTsOnSale() external view returns(NtfProduct[] memory) {
        uint256 totalCreated = nextNftProductId;
        uint256 count = totalNFTsReadyToSell;

        NtfProduct[] memory result = new NtfProduct[](count);

        uint256 j = 0;

        for (uint256 i = 0; i < totalCreated; ) {
            NtfProduct storage nft = NftsProductsList[i];

            if (nft.active && !nft.sold) {
                result[j] = nft;
                unchecked { ++j; }
            }

            unchecked { ++i; }
        }

        return result;
    }

    function GetNFTOnSale(uint256 _nftPostingId) external view returns(NtfProduct memory) {
        NtfProduct memory nft = NftsProductsList[_nftPostingId];
        require(nft.active, "El NFT no esta a la venta");
        require(!nft.sold, "El NFT ya fue vendido");

        return nft;
    }

    function CancelNFTPosting(uint256 _nftProductId) external nonReentrant {
        NtfProduct storage nft = NftsProductsList[_nftProductId];

        require(nft.active, "El NFT ya no esta a la venta");
        require(!nft.sold, "El NFT ya fue vendido");
        require(nft.seller == msg.sender, "Solo el propietario puede cancelar la venta");

        nft.active = false;

        IERC721(nft.nftContractAddress).safeTransferFrom(address(this), nft.seller, nft.tokenId);

        emit PostingCancelled(nft.id, msg.sender);
    }

    function SetWalletContractAddress(address _walletContratAddress) external onlyOwner {
        require(_walletContratAddress != address(0), "Direccion invalida");
        require(_walletContratAddress != walletContractAddress, "El contrato debe ser diferente");

        address old = walletContractAddress;
        walletContractAddress = _walletContratAddress;

        emit WalletContractAddresUpdated(old, _walletContratAddress);
    }

    function SetNewFeeToSellNFT(uint256 _feeToSellNFT) external onlyOwner {
        require(_feeToSellNFT > 0 && _feeToSellNFT <= 10, "La tarifa cobrada debe ser menor al 10%");
        require(_feeToSellNFT != feeToSellNFT, "El contrato ya cuenta con esa tarifa");

        uint256 oldFee = feeToSellNFT;
        feeToSellNFT = _feeToSellNFT * 100;

        emit feeToSellNFTUpdated(oldFee, _feeToSellNFT * 100);
    }

    function WithdrawPendingFees() external onlyOwner nonReentrant {
        uint256 amount = pendingFeesToTransferToWallet;
        
        require(amount > 0, "No hay cuotas pendientes por transferir");
        pendingFeesToTransferToWallet = 0;

        (bool success, ) = payable(walletContractAddress).call{ value: amount }("");
        require(success, "La transferencia fallo");

        emit FeesWithdrawn(walletContractAddress, amount);
    }

    function WithdrawSellerPayments() external nonReentrant {
        uint256 amount = pendingSellerPayments[msg.sender];
        require(amount > 0, "No hay pagos pendientes");

        pendingSellerPayments[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{ value: amount }("");
        require(success, "El pago fallo");
    }

    receive() external payable {}

    fallback() external payable {}
}