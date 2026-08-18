// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {BaseStrategyAdapter} from "./BaseStrategyAdapter.sol";

contract IdleAdapter is BaseStrategyAdapter {
    constructor(IERC20 asset_, address configurator_)
        BaseStrategyAdapter(asset_, configurator_, "Idle Cash")
    {}

    function apyBps() external pure returns (uint32) {
        return 0;
    }

    function totalAssets() public view returns (uint256) {
        return UNDERLYING.balanceOf(address(this));
    }

    function deposit(uint256 assets) external onlyVault nonReentrant returns (uint256 deposited) {
        _pull(assets);
        return assets;
    }

    function withdraw(uint256 assets) external onlyVault nonReentrant returns (uint256 withdrawn) {
        uint256 available = totalAssets();
        if (assets > available) revert InsufficientAssets(assets, available);
        _push(assets);
        return assets;
    }

    function withdrawAll() external onlyVault nonReentrant returns (uint256 withdrawn) {
        withdrawn = totalAssets();
        if (withdrawn != 0) _push(withdrawn);
    }
}
