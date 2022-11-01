// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IVault} from "./interfaces/IVault.sol";
import {INFTWrappingManager} from "./interfaces/INftWrappingManager.sol";
import {Vault} from "./Vault.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

contract Router is Ownable {
    using Math for uint256;
    
    INFTWrappingManager public NFTWrappingManager;
    ISwapRouter public swapRouter;
    address public constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;

    address public protocolTreasury;
    IERC721 public generalNFT;
    IERC721 public guruNFT;

    event Buy(address _vault, address indexed _user, address _tokenIn, uint256 _amount, uint256 _tokenId);
    event Sell(address _vault, address indexed _user, uint256 _tokenId);

    constructor(address _protocolTreasury, address _generalNFT, address _guruNFT) {
        require(_generalNFT != address(0), "Router: General NFT address cannot be zero address");
        generalNFT = IERC721(_generalNFT);
        require(_guruNFT != address(0), "Router: Guru NFT address cannot be zero address");
        guruNFT = IERC721(_guruNFT);
        require(_protocolTreasury != address(0), "Router: Protocol Treasury cannot be zero address");
        protocolTreasury = _protocolTreasury;
    }

    /*///////////////////////////////////////////////////////////////
                            Configuration
    //////////////////////////////////////////////////////////////*/
    function updateSwapRouter(address _swapRouter) public onlyOwner {
        require(_swapRouter != address(0), "Router: SwapRouter cannot be zero address");
        swapRouter = ISwapRouter(_swapRouter);
    }

    function setNFTWrappingManager(address _NFTWrappingManager) public onlyOwner {
        NFTWrappingManager = INFTWrappingManager(_NFTWrappingManager);
    }

    uint256 public protocolFeePercent = 2e16; // 기본 fee : 2%

    function updateProtocolTreasury(address newProtocolTreasury) public onlyOwner {
        require(newProtocolTreasury != address(0), "Router: Protocol Treasury cannot be zero address");
        protocolTreasury = newProtocolTreasury;
    }

    function updateProtocolFeePercent(uint newProtocolFee) public onlyOwner {
        require(0 <= newProtocolFee && newProtocolFee <= 1e18, "Router: Invalid Protocol Fee Percent");
        protocolFeePercent = newProtocolFee;
    }

    /*///////////////////////////////////////////////////////////////
                        Get NFT Information
    //////////////////////////////////////////////////////////////*/
    function getNfts(address _vault )external view returns(uint256[] memory tokenIds) {
        return NFTWrappingManager.getTokenIds(msg.sender, _vault);
    }

    // returns amount of holding asset amount and the asset's address
    function getHoldingAssetAmount(address _vault) external view returns(address asset, uint256 amount) {
        uint256 shares = NFTWrappingManager.getQvtokenAmount(msg.sender, _vault);
        IVault vault = IVault(_vault);
        return (vault.asset(), vault.convertToAssets(shares));
    }
    /*///////////////////////////////////////////////////////////////
                            Buying
    //////////////////////////////////////////////////////////////*/

    // deposit to vault for the first time
    // TODO update method param to get address '_tokenIn'
    function buy(address _vault, uint256 _amount) external {
        IVault vault = IVault(_vault);
        IERC20 qvToken = IERC20(vault);
        IERC20 assetToken = IERC20(vault.asset());
        uint depositAmount;

        // TODO update method param to get address '_tokenIn'
        // for now, it is set as the default param.
        address _tokenIn = address(assetToken);

        if(_tokenIn == address(assetToken)) {
            assetToken.transferFrom(msg.sender, address(this), _amount);
            depositAmount = _amount; // TODO gas fee should be applied
        } else {
            depositAmount = _zapIn(address(assetToken), _tokenIn, _amount);
        }
        // get protocol fee and send it to protocol treasury
        if(guruNFT.balanceOf(msg.sender) == 0 && generalNFT.balanceOf(msg.sender) == 0){
            uint256 protocolFeeAmount = depositAmount.mulDiv(protocolFeePercent, 1e18, Math.Rounding.Down);
            depositAmount -= protocolFeeAmount;
            assetToken.transfer(protocolTreasury, protocolFeeAmount);
        }

        uint256 qvTokenAdded = _depositToVault(_vault, depositAmount);
        
        // _buy(_vault, address(assetToken), _amount); // TODO update param of buy func and its front interface
        qvToken.transfer(address(NFTWrappingManager), qvTokenAdded);
        uint _tokenId = NFTWrappingManager.deposit(msg.sender, address(vault), qvTokenAdded);

        emit Buy(_vault, msg.sender, _tokenIn, _amount, _tokenId);
    }

    // add asset to existing NFT
    // TODO update method param to get address '_tokenIn'
    function buy(uint256 amount, uint256 tokenId) external {
        require(NFTWrappingManager.ownerOf(tokenId) == msg.sender, "only owner of token can change token state");
        (address _vault,,) = NFTWrappingManager.depositInfo(tokenId);
        IVault vault = IVault(_vault);
        IERC20 assetToken = IERC20(vault.asset());
        IERC20 qvToken = IERC20(_vault);
        uint256 depositAmount;

        // TODO update method param to get address '_tokenIn'
        // for now, it is set as the default param.
        address _tokenIn = address(assetToken);

        if(_tokenIn == address(assetToken)) {
            assetToken.transferFrom(msg.sender, address(this), amount);
            depositAmount = amount; // TODO gas fee should be applied
        } else {
            depositAmount = _zapIn(address(assetToken), _tokenIn, amount);
        }

        uint256 qvTokenAdded = _depositToVault(_vault, depositAmount);
        
        // send qvToken to NFTManager
        qvToken.transfer(address(NFTWrappingManager), qvTokenAdded);
        NFTWrappingManager.deposit(qvTokenAdded, tokenId);
        emit Buy(_vault, msg.sender, _tokenIn, amount, tokenId);
    }

    /*///////////////////////////////////////////////////////////////
                            Selling
    //////////////////////////////////////////////////////////////*/

    function sell(uint256 tokenId, uint256 amount) external {
        require(NFTWrappingManager.ownerOf(tokenId) == msg.sender, "only owner of token can change token state");
        (address _vault, uint256 _qvTokenAmount, bool isFullyRedeemed) = NFTWrappingManager.depositInfo(tokenId);
        require(!isFullyRedeemed && amount <= _qvTokenAmount, "not enough token to withdraw");

        IVault vault = IVault(_vault);
        IERC20 qvToken = IERC20(_vault);
        IERC20 assetToken = IERC20(vault.asset());

        // withdraw qvtoken from NFTManager
        uint256 currentAmount = qvToken.balanceOf(address(this));
        NFTWrappingManager.withdraw(tokenId, address(vault), amount);

        require(qvToken.balanceOf(address(this)) - currentAmount == amount, "Router: Amount of qvToken to relay has unexpected value");

        // send qvToken to Vault and redeem it
        uint256 beforeRedeem = assetToken.balanceOf(address(this));
        //qvToken.transfer(address(vault), amount);
        uint256 addedAsset = vault.redeem(amount, address(this), address(this));
        require(assetToken.balanceOf(address(this)) - beforeRedeem == addedAsset, "Router: Amount of assetToken to relay has unexpected value");
        
        
        // send asset to client
        address _tokenOut = address(assetToken); // TODO set _tokenOut as a param
        if(_tokenOut == address(assetToken)) {
            assetToken.transfer(msg.sender, addedAsset);
        } else {
            uint assetInTokenOut = _zapIn(address(assetToken), _tokenOut, addedAsset);
            IERC20(_tokenOut).transfer(msg.sender, assetInTokenOut);
        }
        emit Sell(_vault, msg.sender, tokenId);
    }

    /*///////////////////////////////////////////////////////////////
                        Fee claim for SubDAO
    //////////////////////////////////////////////////////////////*/

    function claimFees(uint256 tokenId, uint256 amount) external {
        (address _vault, , ) = NFTWrappingManager.depositInfo(tokenId);
        
        IVault vault = IVault(_vault);
        IERC20 qvToken = IERC20(_vault);

        require(NFTWrappingManager.ownerOf(tokenId) == msg.sender, "Router: only owner of token can change token state");
        require(vault.isAdmin(msg.sender), "Router: sender does not have ADMIN role");
        require(amount >= vault.balanceOf(_vault), "Router: claim too much fees");

        // claim fees
        uint256 currentAmount = qvToken.balanceOf(address(this));
        vault.claimFees(amount);
        require(qvToken.balanceOf(address(this)) - currentAmount == amount, "Router: Amount of qvToken to relay has unexpected value");

        // send qvToken to NFT manager
        qvToken.transfer(address(NFTWrappingManager), amount);
        NFTWrappingManager.deposit(amount, tokenId);
    }


    /*///////////////////////////////////////////////////////////////
                                Internal
    //////////////////////////////////////////////////////////////*/

    // deposit the asset token into the vault and get nft where qvToken being added
    function _depositToVault(address _vault, uint256 _amount) internal returns(uint256 qvTokenAdded) {
        IVault vault = IVault(_vault);
        IERC20 qvToken = IERC20(vault);
        IERC20 assetToken = IERC20(vault.asset());

        // exchange asset - qvToken with Vault
        uint256 currentAmount = qvToken.balanceOf(address(this));
        assetToken.approve(address(vault), _amount);
        qvTokenAdded = vault.deposit(_amount, address(this));
        
        require(qvToken.balanceOf(address(this)) - currentAmount == qvTokenAdded, "Router: Amount of qvToken to relay has unexpected value");
        
        return qvTokenAdded;
    }


    function _zapIn(address _assetToken, address _tokenIn, uint256 _tokenInAmount) internal returns(uint256 amount) {
        require(IERC20(_tokenIn).allowance(msg.sender, address(this)) >= _tokenInAmount, "Token should be allowed"); 
        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _tokenInAmount);

        uint256 assetAmount = _swap(_tokenInAmount, _tokenIn, _assetToken);
        return assetAmount;
    }

    function _swap(uint256 amountIn, address tokenIn, address tokenOut) internal returns (uint256 amountOut) {
        // Approve the router to spend token.
        TransferHelper.safeApprove(tokenIn, address(swapRouter), amountIn);
        ISwapRouter.ExactInputParams memory params =
            ISwapRouter.ExactInputParams({
                path: abi.encodePacked(
                    tokenIn,
                    uint24(500),
                    USDC,
                    uint24(1000),
                    tokenOut
                ),
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0 // TODO it should be set with SDK or oracle price to avoid front-running 
            });

        amountOut = swapRouter.exactInput(params);
        return amountOut;
    }
}