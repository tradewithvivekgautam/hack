// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public constant MAX_FAUCET_AMOUNT = 100_000e6;

    error FaucetLimitExceeded(uint256 requested, uint256 maximum);
    error ZeroAddress();
    error ZeroAmount();

    constructor(address admin) ERC20("Mock USD Coin", "mUSDC") {
        if (admin == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function faucet(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (amount > MAX_FAUCET_AMOUNT) revert FaucetLimitExceeded(amount, MAX_FAUCET_AMOUNT);
        _mint(msg.sender, amount);
    }

    function mint(address receiver, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (receiver == address(0)) revert ZeroAddress();
        _mint(receiver, amount);
    }
}
