// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Minimal interface for Vault compatible strategies.
/// @dev Designed for out of the box compatibility with Quinoa DAC's strategy.
/// @dev Like cTokens, strategies must be transferrable ERC20s.
abstract contract Strategy is ERC20 {
    /// @notice Returns whether the strategy accepts ETH or an ERC20.
    /// @return True if the strategy accepts ETH or Native Tokens, false otherwise.
    function isCEther() external view virtual returns (bool);

    /// @notice Withdraws a specific amount of underlying tokens from the strategy.
    /// @param amount The amount of underlying tokens to withdraw.
    /// @return An error code, or 0 if the withdrawal was successful.
    function redeemUnderlying(uint256 amount) external virtual returns (uint256);

    /// @notice Returns a user's strategy balance in underlying tokens.
    /// @param user The user to get the underlying balance of.
    /// @return The user's strategy balance in underlying tokens.
    /// @dev May mutate the state of the strategy by accruing interest.
    function balanceOfUnderlying(address user) external virtual returns (uint256);

    /// @notice set emergency status
    /// @param isEmergency If emergency situation is occured, isEmergency value is true
    /// @dev all underlyings would be withdrawn when the 'rebalance' function from the vault would be called if 'isEmergency' being set true
    function setEmergency(bool isEmergency) external virtual returns(bool);
}

/// @notice Minimal interface for Vault strategies that accept ERC20s.
/// @dev Designed for out of the box compatibility with Quinoa DAC's strategy.
abstract contract ERC20Strategy is Strategy {
    /// @notice Returns the underlying ERC20 token the strategy accepts.
    /// @return The underlying ERC20 token the strategy accepts.
    function underlying() external view virtual returns (ERC20);

    /// @notice Deposit a specific amount of underlying tokens into the strategy.
    /// @param amount The amount of underlying tokens to deposit.
    /// @return An error code, or 0 if the deposit was successful.
    function mint(uint256 amount) external virtual returns (uint256);
}

/// @notice Minimal interface for Vault strategies that accept ETH.
/// @dev Designed for out of the box compatibility with Fuse cEther.
abstract contract ETHStrategy is Strategy {
    /// @notice Deposit a specific amount of ETH into the strategy.
    /// @dev The amount of ETH is specified via msg.value. Reverts on error.
    function mint() external payable virtual;
}