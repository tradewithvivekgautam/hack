// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {BaseStrategyAdapter} from "./BaseStrategyAdapter.sol";

interface IMintableAsset {
    function mint(address receiver, uint256 amount) external;
}

/// @notice Testnet-only production-shaped adapter with deterministic linear yield.
abstract contract MockYieldStrategyAdapter is BaseStrategyAdapter {
    uint256 public constant BASIS_POINTS = 10_000;
    uint256 public constant YEAR = 365 days;

    uint64 public lastAccrualAt;
    uint32 private immutable FIXED_APY_BPS;

    event YieldAccrued(uint256 assets);

    constructor(
        IERC20 asset_,
        address configurator_,
        string memory name_,
        uint32 apyBps_
    ) BaseStrategyAdapter(asset_, configurator_, name_) {
        FIXED_APY_BPS = apyBps_;
        lastAccrualAt = uint64(block.timestamp);
    }

    function apyBps() external view returns (uint32) {
        return FIXED_APY_BPS;
    }

    function totalAssets() public view returns (uint256) {
        return UNDERLYING.balanceOf(address(this)) + _pendingYield();
    }

    function deposit(uint256 assets) external onlyVault nonReentrant returns (uint256 deposited) {
        _accrue();
        _pull(assets);
        return assets;
    }

    function withdraw(uint256 assets) external onlyVault nonReentrant returns (uint256 withdrawn) {
        _accrue();
        uint256 available = UNDERLYING.balanceOf(address(this));
        if (assets > available) revert InsufficientAssets(assets, available);
        _push(assets);
        return assets;
    }

    function withdrawAll() external onlyVault nonReentrant returns (uint256 withdrawn) {
        _accrue();
        withdrawn = UNDERLYING.balanceOf(address(this));
        if (withdrawn != 0) _push(withdrawn);
    }

    function _pendingYield() internal view returns (uint256) {
        uint256 principal = UNDERLYING.balanceOf(address(this));
        if (principal == 0 || FIXED_APY_BPS == 0) return 0;
        uint256 elapsed = block.timestamp - lastAccrualAt;
        return (principal * FIXED_APY_BPS * elapsed) / BASIS_POINTS / YEAR;
    }

    function _accrue() internal {
        uint256 accrued = _pendingYield();
        lastAccrualAt = uint64(block.timestamp);
        if (accrued == 0) return;
        IMintableAsset(address(UNDERLYING)).mint(address(this), accrued);
        emit YieldAccrued(accrued);
    }
}
