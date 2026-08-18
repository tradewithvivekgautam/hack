// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IReasoningRegistry {
    struct Decision {
        uint64 timestamp;
        uint16[3] weights;
        bytes32 reasoningHash;
        string reasoningCid;
        address agent;
        uint256 totalAssets;
    }

    function epoch() external view returns (uint256);

    function recordDecision(
        uint16[3] calldata weights,
        bytes32 reasoningHash,
        string calldata reasoningCid,
        address agent,
        uint256 totalAssets
    ) external returns (uint256 decisionEpoch);

    function decision(uint256 decisionEpoch) external view returns (Decision memory);
}
