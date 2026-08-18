// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MockYieldStrategyAdapter} from "./MockYieldStrategyAdapter.sol";

contract LendingAdapter is MockYieldStrategyAdapter {
    constructor(IERC20 asset_, address configurator_, uint32 apyBps_)
        MockYieldStrategyAdapter(asset_, configurator_, "DeFi Lending", apyBps_)
    {}
}
