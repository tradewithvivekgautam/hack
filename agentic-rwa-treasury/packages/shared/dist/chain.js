import { defineChain } from "viem";
export const hardhatLocal = defineChain({
    id: 31_337,
    name: "Hardhat Local",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
        default: { http: ["http://127.0.0.1:8545"] },
    },
    contracts: {
        multicall3: {
            address: "0xcA11bde05977b3631167028862bE2a173976CA11",
        },
    },
    testnet: true,
});
export const xLayerTestnet = defineChain({
    id: 1_952,
    name: "X Layer Testnet",
    nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://xlayertestrpc.okx.com"] },
        public: { http: ["https://xlayertestrpc.okx.com"] },
    },
    contracts: {
        multicall3: {
            address: "0xcA11bde05977b3631167028862bE2a173976CA11",
        },
    },
    blockExplorers: {
        default: { name: "OKLink", url: "https://www.oklink.com/x-layer-test" },
    },
    testnet: true,
});
export const xLayerMainnet = defineChain({
    id: 196,
    name: "X Layer",
    nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
    rpcUrls: { default: { http: ["https://rpc.xlayer.tech"] } },
    blockExplorers: {
        default: { name: "OKLink", url: "https://www.oklink.com/x-layer" },
    },
});
export const SUPPORTED_CHAINS = [
    hardhatLocal,
    xLayerTestnet,
    xLayerMainnet,
];
export function chainById(chainId) {
    const chain = SUPPORTED_CHAINS.find((candidate) => candidate.id === chainId);
    if (!chain)
        throw new Error(`Unsupported chain ${chainId}.`);
    return chain;
}
//# sourceMappingURL=chain.js.map