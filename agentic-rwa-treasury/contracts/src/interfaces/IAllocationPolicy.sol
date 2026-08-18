// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IAllocationPolicy {
    function strategyCount() external view returns (uint8);
    function maxWeightBps() external view returns (uint16);
    function maxTurnoverBps() external view returns (uint16);
    function cooldownSeconds() external view returns (uint32);

    function turnoverBps(
        uint16[3] calldata currentWeights,
        uint16[3] calldata proposedWeights
    ) external pure returns (uint16);

    function validate(
        uint16[3] calldata currentWeights,
        uint16[3] calldata proposedWeights,
        uint64 lastRebalanceAt
    ) external view;
}
