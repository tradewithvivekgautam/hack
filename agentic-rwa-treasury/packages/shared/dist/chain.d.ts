export declare const hardhatLocal: {
    blockExplorers?: {
        [key: string]: {
            name: string;
            url: string;
            apiUrl?: string | undefined;
        };
        default: {
            name: string;
            url: string;
            apiUrl?: string | undefined;
        };
    } | undefined;
    blockTime?: number | undefined;
    contracts: {
        readonly multicall3: {
            readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 31337;
    name: "Hardhat Local";
    nativeCurrency: {
        readonly name: "Ether";
        readonly symbol: "ETH";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["http://127.0.0.1:8545"];
        };
    };
    sourceId?: number | undefined;
    supportsTransactionReplacementDetection?: boolean | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
};
export declare const xLayerTestnet: {
    blockExplorers: {
        readonly default: {
            readonly name: "OKLink";
            readonly url: "https://www.oklink.com/x-layer-test";
        };
    };
    blockTime?: number | undefined;
    contracts: {
        readonly multicall3: {
            readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 1952;
    name: "X Layer Testnet";
    nativeCurrency: {
        readonly name: "OKB";
        readonly symbol: "OKB";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://xlayertestrpc.okx.com"];
        };
        readonly public: {
            readonly http: readonly ["https://xlayertestrpc.okx.com"];
        };
    };
    sourceId?: number | undefined;
    supportsTransactionReplacementDetection?: boolean | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
};
export declare const xLayerMainnet: {
    blockExplorers: {
        readonly default: {
            readonly name: "OKLink";
            readonly url: "https://www.oklink.com/x-layer";
        };
    };
    blockTime?: number | undefined;
    contracts?: import("viem").Prettify<{
        [key: string]: import("viem").ChainContract | {
            [sourceId: number]: import("viem").ChainContract | undefined;
        } | undefined;
    } & {
        ensRegistry?: import("viem").ChainContract | undefined;
        ensUniversalResolver?: import("viem").ChainContract | undefined;
        multicall3?: import("viem").ChainContract | undefined;
        erc6492Verifier?: import("viem").ChainContract | undefined;
    }> | undefined;
    ensTlds?: readonly string[] | undefined;
    id: 196;
    name: "X Layer";
    nativeCurrency: {
        readonly name: "OKB";
        readonly symbol: "OKB";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://rpc.xlayer.tech"];
        };
    };
    sourceId?: number | undefined;
    supportsTransactionReplacementDetection?: boolean | undefined;
    testnet?: boolean | undefined;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
};
export declare const SUPPORTED_CHAINS: readonly [{
    blockExplorers?: {
        [key: string]: {
            name: string;
            url: string;
            apiUrl?: string | undefined;
        };
        default: {
            name: string;
            url: string;
            apiUrl?: string | undefined;
        };
    } | undefined;
    blockTime?: number | undefined;
    contracts: {
        readonly multicall3: {
            readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 31337;
    name: "Hardhat Local";
    nativeCurrency: {
        readonly name: "Ether";
        readonly symbol: "ETH";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["http://127.0.0.1:8545"];
        };
    };
    sourceId?: number | undefined;
    supportsTransactionReplacementDetection?: boolean | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
}, {
    blockExplorers: {
        readonly default: {
            readonly name: "OKLink";
            readonly url: "https://www.oklink.com/x-layer-test";
        };
    };
    blockTime?: number | undefined;
    contracts: {
        readonly multicall3: {
            readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 1952;
    name: "X Layer Testnet";
    nativeCurrency: {
        readonly name: "OKB";
        readonly symbol: "OKB";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://xlayertestrpc.okx.com"];
        };
        readonly public: {
            readonly http: readonly ["https://xlayertestrpc.okx.com"];
        };
    };
    sourceId?: number | undefined;
    supportsTransactionReplacementDetection?: boolean | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
}, {
    blockExplorers: {
        readonly default: {
            readonly name: "OKLink";
            readonly url: "https://www.oklink.com/x-layer";
        };
    };
    blockTime?: number | undefined;
    contracts?: import("viem").Prettify<{
        [key: string]: import("viem").ChainContract | {
            [sourceId: number]: import("viem").ChainContract | undefined;
        } | undefined;
    } & {
        ensRegistry?: import("viem").ChainContract | undefined;
        ensUniversalResolver?: import("viem").ChainContract | undefined;
        multicall3?: import("viem").ChainContract | undefined;
        erc6492Verifier?: import("viem").ChainContract | undefined;
    }> | undefined;
    ensTlds?: readonly string[] | undefined;
    id: 196;
    name: "X Layer";
    nativeCurrency: {
        readonly name: "OKB";
        readonly symbol: "OKB";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://rpc.xlayer.tech"];
        };
    };
    sourceId?: number | undefined;
    supportsTransactionReplacementDetection?: boolean | undefined;
    testnet?: boolean | undefined;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
}];
export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]["id"];
export declare function chainById(chainId: number): {
    blockExplorers?: {
        [key: string]: {
            name: string;
            url: string;
            apiUrl?: string | undefined;
        };
        default: {
            name: string;
            url: string;
            apiUrl?: string | undefined;
        };
    } | undefined;
    blockTime?: number | undefined;
    contracts: {
        readonly multicall3: {
            readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 31337;
    name: "Hardhat Local";
    nativeCurrency: {
        readonly name: "Ether";
        readonly symbol: "ETH";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["http://127.0.0.1:8545"];
        };
    };
    sourceId?: number | undefined;
    supportsTransactionReplacementDetection?: boolean | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
} | {
    blockExplorers: {
        readonly default: {
            readonly name: "OKLink";
            readonly url: "https://www.oklink.com/x-layer-test";
        };
    };
    blockTime?: number | undefined;
    contracts: {
        readonly multicall3: {
            readonly address: "0xcA11bde05977b3631167028862bE2a173976CA11";
        };
    };
    ensTlds?: readonly string[] | undefined;
    id: 1952;
    name: "X Layer Testnet";
    nativeCurrency: {
        readonly name: "OKB";
        readonly symbol: "OKB";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://xlayertestrpc.okx.com"];
        };
        readonly public: {
            readonly http: readonly ["https://xlayertestrpc.okx.com"];
        };
    };
    sourceId?: number | undefined;
    supportsTransactionReplacementDetection?: boolean | undefined;
    testnet: true;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
} | {
    blockExplorers: {
        readonly default: {
            readonly name: "OKLink";
            readonly url: "https://www.oklink.com/x-layer";
        };
    };
    blockTime?: number | undefined;
    contracts?: import("viem").Prettify<{
        [key: string]: import("viem").ChainContract | {
            [sourceId: number]: import("viem").ChainContract | undefined;
        } | undefined;
    } & {
        ensRegistry?: import("viem").ChainContract | undefined;
        ensUniversalResolver?: import("viem").ChainContract | undefined;
        multicall3?: import("viem").ChainContract | undefined;
        erc6492Verifier?: import("viem").ChainContract | undefined;
    }> | undefined;
    ensTlds?: readonly string[] | undefined;
    id: 196;
    name: "X Layer";
    nativeCurrency: {
        readonly name: "OKB";
        readonly symbol: "OKB";
        readonly decimals: 18;
    };
    experimental_preconfirmationTime?: number | undefined;
    rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://rpc.xlayer.tech"];
        };
    };
    sourceId?: number | undefined;
    supportsTransactionReplacementDetection?: boolean | undefined;
    testnet?: boolean | undefined;
    custom?: Record<string, unknown> | undefined;
    extendSchema?: Record<string, unknown> | undefined;
    fees?: import("viem").ChainFees<undefined> | undefined;
    formatters?: undefined;
    prepareTransactionRequest?: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | [fn: ((args: import("viem").PrepareTransactionRequestParameters, options: {
        client: import("viem").Client;
        phase: "afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction";
    }) => Promise<import("viem").PrepareTransactionRequestParameters>) | undefined, options: {
        runAt: readonly ("afterFillParameters" | "beforeFillParameters" | "beforeFillTransaction")[];
    }] | undefined;
    serializers?: import("viem").ChainSerializers<undefined, import("viem").TransactionSerializable> | undefined;
    verifyHash?: ((client: import("viem").Client, parameters: import("viem").VerifyHashActionParameters) => Promise<import("viem").VerifyHashActionReturnType>) | undefined;
};
//# sourceMappingURL=chain.d.ts.map