// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IAllocationPolicy} from "./interfaces/IAllocationPolicy.sol";

/// @notice Immutable deterministic guardrails for AI-proposed allocations.
contract AllocationPolicy is IAllocationPolicy {
    uint16 public constant BASIS_POINTS = 10_000;

    uint8 public immutable override strategyCount = 3;
    uint16 public immutable override maxWeightBps;
    uint16 public immutable override maxTurnoverBps;
    uint32 public immutable override cooldownSeconds;

    error InvalidPolicyValue();
    error InvalidWeightSum(uint256 sum);
    error StrategyCapExceeded(uint256 index, uint256 weight, uint256 maximum);
    error TurnoverExceeded(uint256 turnover, uint256 maximum);
    error CooldownActive(uint256 availableAt);

    constructor(uint16 maxWeightBps_, uint16 maxTurnoverBps_, uint32 cooldownSeconds_) {
        // Three strategies must be able to reach 100%, but one strategy may never own the whole vault.
        if (
            maxWeightBps_ < BASIS_POINTS / 3 ||
            maxWeightBps_ >= BASIS_POINTS ||
            maxTurnoverBps_ == 0 ||
            maxTurnoverBps_ > BASIS_POINTS ||
            cooldownSeconds_ == 0
        ) revert InvalidPolicyValue();

        maxWeightBps = maxWeightBps_;
        maxTurnoverBps = maxTurnoverBps_;
        cooldownSeconds = cooldownSeconds_;
    }

    /// @notice One-way portfolio turnover: sum(abs(new-old)) / 2.
    function turnoverBps(
        uint16[3] calldata currentWeights,
        uint16[3] calldata proposedWeights
    ) public pure override returns (uint16) {
        uint256 absoluteMovement;
        for (uint256 index; index < 3; ++index) {
            uint16 current = currentWeights[index];
            uint16 proposed = proposedWeights[index];
            absoluteMovement += current > proposed ? current - proposed : proposed - current;
        }
        return uint16(absoluteMovement / 2);
    }

    function validate(
        uint16[3] calldata currentWeights,
        uint16[3] calldata proposedWeights,
        uint64 lastRebalanceAt
    ) external view override {
        uint256 currentSum;
        uint256 proposedSum;
        for (uint256 index; index < 3; ++index) {
            currentSum += currentWeights[index];
            uint16 proposed = proposedWeights[index];
            if (proposed > maxWeightBps) {
                revert StrategyCapExceeded(index, proposed, maxWeightBps);
            }
            proposedSum += proposed;
        }
        if (currentSum != BASIS_POINTS) revert InvalidWeightSum(currentSum);
        if (proposedSum != BASIS_POINTS) revert InvalidWeightSum(proposedSum);

        uint16 turnover = turnoverBps(currentWeights, proposedWeights);
        if (turnover > maxTurnoverBps) {
            revert TurnoverExceeded(turnover, maxTurnoverBps);
        }

        if (lastRebalanceAt != 0) {
            uint256 availableAt = uint256(lastRebalanceAt) + cooldownSeconds;
            if (block.timestamp < availableAt) revert CooldownActive(availableAt);
        }
    }
}
