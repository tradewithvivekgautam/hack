// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IReasoningRegistry} from "./interfaces/IReasoningRegistry.sol";

/// @notice Append-only integrity registry for the exact decision memo acted on by the vault.
contract ReasoningRegistry is AccessControl, IReasoningRegistry {
    bytes32 public constant WRITER_ROLE = keccak256("WRITER_ROLE");

    uint256 public override epoch;
    mapping(uint256 decisionEpoch => Decision value) private DECISIONS;

    error EmptyReasoningCid();
    error EmptyReasoningHash();
    error InvalidAgent();
    error DecisionNotFound(uint256 decisionEpoch);

    event DecisionRecorded(
        uint256 indexed epoch,
        uint64 timestamp,
        uint16[3] weights,
        bytes32 indexed reasoningHash,
        string reasoningCid,
        address indexed agent,
        uint256 totalAssets
    );

    constructor(address admin) {
        if (admin == address(0)) revert InvalidAgent();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function recordDecision(
        uint16[3] calldata weights,
        bytes32 reasoningHash,
        string calldata reasoningCid,
        address agent,
        uint256 totalAssets
    ) external override onlyRole(WRITER_ROLE) returns (uint256 decisionEpoch) {
        if (reasoningHash == bytes32(0)) revert EmptyReasoningHash();
        if (bytes(reasoningCid).length == 0) revert EmptyReasoningCid();
        if (agent == address(0)) revert InvalidAgent();

        decisionEpoch = ++epoch;
        uint64 timestamp = uint64(block.timestamp);
        DECISIONS[decisionEpoch] = Decision({
            timestamp: timestamp,
            weights: weights,
            reasoningHash: reasoningHash,
            reasoningCid: reasoningCid,
            agent: agent,
            totalAssets: totalAssets
        });

        emit DecisionRecorded(
            decisionEpoch,
            timestamp,
            weights,
            reasoningHash,
            reasoningCid,
            agent,
            totalAssets
        );
    }

    function decision(uint256 decisionEpoch) external view override returns (Decision memory) {
        Decision memory value = DECISIONS[decisionEpoch];
        if (value.timestamp == 0) revert DecisionNotFound(decisionEpoch);
        return value;
    }
}
