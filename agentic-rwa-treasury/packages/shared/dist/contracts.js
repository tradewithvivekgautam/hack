import { parseAbi } from "viem";
const erc20Signatures = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
];
export const erc20Abi = parseAbi(erc20Signatures);
export const mockUsdcAbi = parseAbi([...erc20Signatures, "function faucet(uint256 amount)"]);
export const vaultAbi = parseAbi([
    ...erc20Signatures,
    "function asset() view returns (address)",
    "function totalAssets() view returns (uint256)",
    "function convertToAssets(uint256 shares) view returns (uint256 assets)",
    "function convertToShares(uint256 assets) view returns (uint256 shares)",
    "function previewDeposit(uint256 assets) view returns (uint256 shares)",
    "function previewMint(uint256 shares) view returns (uint256 assets)",
    "function previewWithdraw(uint256 assets) view returns (uint256 shares)",
    "function previewRedeem(uint256 shares) view returns (uint256 assets)",
    "function maxDeposit(address receiver) view returns (uint256 assets)",
    "function maxMint(address receiver) view returns (uint256 shares)",
    "function maxWithdraw(address owner) view returns (uint256 assets)",
    "function maxRedeem(address owner) view returns (uint256 shares)",
    "function deposit(uint256 assets, address receiver) returns (uint256 shares)",
    "function mint(uint256 shares, address receiver) returns (uint256 assets)",
    "function withdraw(uint256 assets, address receiver, address owner) returns (uint256 shares)",
    "function redeem(uint256 shares, address receiver, address owner) returns (uint256 assets)",
    "function strategyAdapter(uint256 index) view returns (address)",
    "function targetWeights() view returns (uint16[3])",
    "function currentWeights() view returns (uint16[3])",
    "function strategyAssets() view returns (uint256[3])",
    "function strategyApys() view returns (uint32[3])",
    "function weightedApyBps() view returns (uint256)",
    "function lastRebalanceAt() view returns (uint64)",
    "function paused() view returns (bool)",
    "function adaptersReady() view returns (bool)",
    "function pause()",
    "function unpause()",
    "function emergencyExitStrategy(uint256 index) returns (uint256 recovered)",
    "function rebalance(uint16[3] proposedWeights, bytes32 reasoningHash, string reasoningCid) returns (uint256 decisionEpoch)",
    "event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares)",
    "event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)",
    "event Rebalanced(uint256 indexed epoch, uint16[3] previousWeights, uint16[3] newWeights, bytes32 indexed reasoningHash, string reasoningCid, address indexed agent, uint256 totalAssets)",
    "event EmergencyStrategyExit(uint256 indexed strategyIndex, uint256 assetsRecovered)",
]);
export const policyAbi = parseAbi([
    "function maxWeightBps() view returns (uint16)",
    "function maxTurnoverBps() view returns (uint16)",
    "function cooldownSeconds() view returns (uint32)",
    "function turnoverBps(uint16[3] currentWeights, uint16[3] proposedWeights) pure returns (uint16)",
    "function validate(uint16[3] currentWeights, uint16[3] proposedWeights, uint64 lastRebalanceAt) view",
]);
export const registryAbi = parseAbi([
    "function epoch() view returns (uint256)",
    "function decision(uint256 decisionEpoch) view returns ((uint64 timestamp, uint16[3] weights, bytes32 reasoningHash, string reasoningCid, address agent, uint256 totalAssets))",
    "event DecisionRecorded(uint256 indexed epoch, uint64 timestamp, uint16[3] weights, bytes32 indexed reasoningHash, string reasoningCid, address indexed agent, uint256 totalAssets)",
]);
export const strategyAdapterAbi = parseAbi([
    "function asset() view returns (address)",
    "function vault() view returns (address)",
    "function name() view returns (string)",
    "function totalAssets() view returns (uint256)",
    "function apyBps() view returns (uint32)",
]);
//# sourceMappingURL=contracts.js.map