// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IStrategyAdapter {
    function asset() external view returns (address);
    function vault() external view returns (address);
    function name() external view returns (string memory);
    function totalAssets() external view returns (uint256);
    function apyBps() external view returns (uint32);
    function setVault(address vault_) external;
    function deposit(uint256 assets) external returns (uint256 deposited);
    function withdraw(uint256 assets) external returns (uint256 withdrawn);
    function withdrawAll() external returns (uint256 withdrawn);
}
