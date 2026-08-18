// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IAllocationPolicy} from "./interfaces/IAllocationPolicy.sol";
import {IReasoningRegistry} from "./interfaces/IReasoningRegistry.sol";
import {IStrategyAdapter} from "./interfaces/IStrategyAdapter.sol";

/// @notice ERC-4626 money container. The agent can only request policy-bounded rebalances.
contract RwaTreasuryVault is ERC4626, AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint16 public constant BASIS_POINTS = 10_000;
    uint8 public constant STRATEGY_COUNT = 3;
    uint8 public constant RWA_INDEX = 0;
    uint8 public constant LENDING_INDEX = 1;
    uint8 public constant IDLE_INDEX = 2;

    bytes32 public constant AGENT_ROLE = keccak256("AGENT_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    IAllocationPolicy public immutable policy;
    IReasoningRegistry public immutable registry;
    IStrategyAdapter[3] private ADAPTERS;

    uint16[3] private TARGET_WEIGHTS;
    uint64 public lastRebalanceAt;

    error ZeroAddress();
    error InvalidAdapter(uint256 index);
    error AdapterNotReady(uint256 index, address configuredVault);
    error DuplicateAdapter(uint256 firstIndex, uint256 secondIndex);
    error InvalidInitialWeights();
    error InsufficientVaultLiquidity(uint256 requested, uint256 available);
    error InsufficientRebalanceLiquidity(uint256 required, uint256 available);
    error StrategyIndexOutOfBounds(uint256 index);
    error AssetInvariantViolated(uint256 beforeAssets, uint256 afterAssets);

    event Rebalanced(
        uint256 indexed epoch,
        uint16[3] previousWeights,
        uint16[3] newWeights,
        bytes32 indexed reasoningHash,
        string reasoningCid,
        address indexed agent,
        uint256 totalAssets
    );
    event EmergencyStrategyExit(uint256 indexed strategyIndex, uint256 assetsRecovered);

    constructor(
        IERC20 asset_,
        IAllocationPolicy policy_,
        IReasoningRegistry registry_,
        IStrategyAdapter[3] memory adapters_,
        uint16[3] memory initialWeights_,
        address admin_,
        address agent_
    ) ERC20("RWA Treasury USD", "rtUSD") ERC4626(asset_) {
        if (
            address(asset_) == address(0) ||
            address(policy_) == address(0) ||
            address(registry_) == address(0) ||
            admin_ == address(0) ||
            agent_ == address(0)
        ) revert ZeroAddress();

        uint256 sum;
        for (uint256 index; index < STRATEGY_COUNT; ++index) {
            IStrategyAdapter adapter = adapters_[index];
            if (address(adapter) == address(0) || adapter.asset() != address(asset_)) {
                revert InvalidAdapter(index);
            }
            if (initialWeights_[index] > policy_.maxWeightBps()) revert InvalidInitialWeights();
            sum += initialWeights_[index];
            ADAPTERS[index] = adapter;
        }
        if (sum != BASIS_POINTS) revert InvalidInitialWeights();

        for (uint256 left; left < STRATEGY_COUNT; ++left) {
            for (uint256 right = left + 1; right < STRATEGY_COUNT; ++right) {
                if (address(adapters_[left]) == address(adapters_[right])) {
                    revert DuplicateAdapter(left, right);
                }
            }
        }

        policy = policy_;
        registry = registry_;
        TARGET_WEIGHTS = initialWeights_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(GOVERNANCE_ROLE, admin_);
        _grantRole(AGENT_ROLE, agent_);
    }

    function strategyAdapter(uint256 index) external view returns (address) {
        if (index >= STRATEGY_COUNT) revert StrategyIndexOutOfBounds(index);
        return address(ADAPTERS[index]);
    }

    function targetWeights() external view returns (uint16[3] memory) {
        return TARGET_WEIGHTS;
    }

    function adaptersReady() public view returns (bool) {
        for (uint256 index; index < STRATEGY_COUNT; ++index) {
            if (ADAPTERS[index].vault() != address(this)) return false;
        }
        return true;
    }

    function strategyAssets() public view returns (uint256[3] memory assetsByStrategy) {
        for (uint256 index; index < STRATEGY_COUNT; ++index) {
            assetsByStrategy[index] = ADAPTERS[index].totalAssets();
        }
    }

    function strategyApys() external view returns (uint32[3] memory apys) {
        for (uint256 index; index < STRATEGY_COUNT; ++index) {
            apys[index] = ADAPTERS[index].apyBps();
        }
    }

    function totalAssets() public view override returns (uint256 totalManagedAssets) {
        totalManagedAssets = IERC20(asset()).balanceOf(address(this));
        for (uint256 index; index < STRATEGY_COUNT; ++index) {
            totalManagedAssets += ADAPTERS[index].totalAssets();
        }
    }

    function currentWeights() public view returns (uint16[3] memory weights) {
        uint256 total = totalAssets();
        if (total == 0) return TARGET_WEIGHTS;

        uint256 rwaAssets = ADAPTERS[RWA_INDEX].totalAssets();
        uint256 lendingAssets = ADAPTERS[LENDING_INDEX].totalAssets();
        weights[RWA_INDEX] = uint16((rwaAssets * BASIS_POINTS) / total);
        weights[LENDING_INDEX] = uint16((lendingAssets * BASIS_POINTS) / total);
        weights[IDLE_INDEX] = uint16(BASIS_POINTS - weights[RWA_INDEX] - weights[LENDING_INDEX]);
    }

    function weightedApyBps() external view returns (uint256 weightedApy) {
        uint16[3] memory weights = currentWeights();
        for (uint256 index; index < STRATEGY_COUNT; ++index) {
            weightedApy += (uint256(weights[index]) * ADAPTERS[index].apyBps()) / BASIS_POINTS;
        }
    }

    function maxDeposit(address receiver) public view override returns (uint256) {
        if (paused() || !adaptersReady()) return 0;
        return super.maxDeposit(receiver);
    }

    function maxMint(address receiver) public view override returns (uint256) {
        if (paused() || !adaptersReady()) return 0;
        return super.maxMint(receiver);
    }

    function deposit(
        uint256 assets,
        address receiver
    ) public override whenNotPaused nonReentrant returns (uint256 shares) {
        _requireAdaptersReady();
        return super.deposit(assets, receiver);
    }

    function mint(
        uint256 shares,
        address receiver
    ) public override whenNotPaused nonReentrant returns (uint256 assets) {
        _requireAdaptersReady();
        return super.mint(shares, receiver);
    }

    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) public override nonReentrant returns (uint256 shares) {
        _requireAdaptersReady();
        return super.withdraw(assets, receiver, owner);
    }

    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) public override nonReentrant returns (uint256 assets) {
        _requireAdaptersReady();
        return super.redeem(shares, receiver, owner);
    }

    function rebalance(
        uint16[3] calldata proposedWeights,
        bytes32 reasoningHash,
        string calldata reasoningCid
    ) external onlyRole(AGENT_ROLE) whenNotPaused nonReentrant returns (uint256 decisionEpoch) {
        _requireAdaptersReady();
        uint16[3] memory previousWeights = currentWeights();
        policy.validate(previousWeights, proposedWeights, lastRebalanceAt);

        uint256 assetsBefore = totalAssets();
        uint256[3] memory targetAssets = _targetAssets(assetsBefore, proposedWeights);

        // Phase one: withdraw every over-allocated strategy before funding any deficit.
        for (uint256 index; index < STRATEGY_COUNT; ++index) {
            uint256 current = ADAPTERS[index].totalAssets();
            if (current > targetAssets[index]) {
                ADAPTERS[index].withdraw(current - targetAssets[index]);
            }
        }

        // Phase two: fund every under-allocated strategy from the now-liquid vault balance.
        for (uint256 index; index < STRATEGY_COUNT; ++index) {
            uint256 current = ADAPTERS[index].totalAssets();
            if (current < targetAssets[index]) {
                _depositIntoAdapter(index, targetAssets[index] - current);
            }
        }

        uint256 assetsAfter = totalAssets();
        if (assetsAfter != assetsBefore) revert AssetInvariantViolated(assetsBefore, assetsAfter);

        TARGET_WEIGHTS = proposedWeights;
        lastRebalanceAt = uint64(block.timestamp);
        decisionEpoch = registry.recordDecision(
            proposedWeights,
            reasoningHash,
            reasoningCid,
            msg.sender,
            assetsAfter
        );

        emit Rebalanced(
            decisionEpoch,
            previousWeights,
            proposedWeights,
            reasoningHash,
            reasoningCid,
            msg.sender,
            assetsAfter
        );
    }

    function pause() external onlyRole(GOVERNANCE_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(GOVERNANCE_ROLE) {
        _unpause();
    }

    function emergencyExitStrategy(
        uint256 index
    ) external onlyRole(GOVERNANCE_ROLE) whenPaused nonReentrant returns (uint256 recovered) {
        if (index >= STRATEGY_COUNT) revert StrategyIndexOutOfBounds(index);
        _requireAdaptersReady();
        recovered = ADAPTERS[index].withdrawAll();
        emit EmergencyStrategyExit(index, recovered);
    }

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override {
        super._deposit(caller, receiver, assets, shares);
        uint256[3] memory allocations = _targetAssets(assets, TARGET_WEIGHTS);
        for (uint256 index; index < STRATEGY_COUNT; ++index) {
            if (allocations[index] != 0) _depositIntoAdapter(index, allocations[index]);
        }
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        _ensureLiquidity(assets);
        super._withdraw(caller, receiver, owner, assets, shares);
    }

    function _ensureLiquidity(uint256 assets) internal {
        IERC20 underlying = IERC20(asset());
        uint256 available = underlying.balanceOf(address(this));
        if (available >= assets) return;

        uint8[3] memory withdrawalOrder = [IDLE_INDEX, LENDING_INDEX, RWA_INDEX];
        for (uint256 orderIndex; orderIndex < STRATEGY_COUNT && available < assets; ++orderIndex) {
            IStrategyAdapter adapter = ADAPTERS[withdrawalOrder[orderIndex]];
            uint256 adapterAssets = adapter.totalAssets();
            if (adapterAssets == 0) continue;
            uint256 needed = assets - available;
            adapter.withdraw(needed < adapterAssets ? needed : adapterAssets);
            available = underlying.balanceOf(address(this));
        }

        if (available < assets) revert InsufficientVaultLiquidity(assets, available);
    }

    function _depositIntoAdapter(uint256 index, uint256 assets) internal {
        uint256 available = IERC20(asset()).balanceOf(address(this));
        if (available < assets) revert InsufficientRebalanceLiquidity(assets, available);
        IERC20(asset()).forceApprove(address(ADAPTERS[index]), assets);
        ADAPTERS[index].deposit(assets);
    }

    function _requireAdaptersReady() internal view {
        for (uint256 index; index < STRATEGY_COUNT; ++index) {
            address configuredVault = ADAPTERS[index].vault();
            if (configuredVault != address(this)) revert AdapterNotReady(index, configuredVault);
        }
    }

    function _targetAssets(
        uint256 total,
        uint16[3] memory weights
    ) internal pure returns (uint256[3] memory targets) {
        targets[RWA_INDEX] = (total * weights[RWA_INDEX]) / BASIS_POINTS;
        targets[LENDING_INDEX] = (total * weights[LENDING_INDEX]) / BASIS_POINTS;
        targets[IDLE_INDEX] = total - targets[RWA_INDEX] - targets[LENDING_INDEX];
    }
}
