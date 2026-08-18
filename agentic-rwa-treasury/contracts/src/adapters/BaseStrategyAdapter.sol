// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IStrategyAdapter} from "../interfaces/IStrategyAdapter.sol";

abstract contract BaseStrategyAdapter is IStrategyAdapter, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 internal immutable UNDERLYING;
    address public immutable configurator;
    address public vault;
    string private ADAPTER_NAME;

    error OnlyVault();
    error OnlyConfigurator();
    error ZeroAddress();
    error ZeroAssets();
    error VaultAlreadyConfigured();
    error InsufficientAssets(uint256 requested, uint256 available);

    event VaultConfigured(address indexed vault);

    modifier onlyVault() {
        if (msg.sender != vault) revert OnlyVault();
        _;
    }

    modifier onlyConfigurator() {
        if (msg.sender != configurator) revert OnlyConfigurator();
        _;
    }

    constructor(IERC20 asset_, address configurator_, string memory name_) {
        if (address(asset_) == address(0) || configurator_ == address(0)) revert ZeroAddress();
        UNDERLYING = asset_;
        configurator = configurator_;
        ADAPTER_NAME = name_;
    }

    function asset() external view returns (address) {
        return address(UNDERLYING);
    }

    function name() external view returns (string memory) {
        return ADAPTER_NAME;
    }

    function setVault(address vault_) external onlyConfigurator {
        if (vault_ == address(0)) revert ZeroAddress();
        if (vault != address(0)) revert VaultAlreadyConfigured();
        vault = vault_;
        emit VaultConfigured(vault_);
    }

    function _pull(uint256 assets) internal {
        if (assets == 0) revert ZeroAssets();
        UNDERLYING.safeTransferFrom(msg.sender, address(this), assets);
    }

    function _push(uint256 assets) internal {
        UNDERLYING.safeTransfer(msg.sender, assets);
    }
}
