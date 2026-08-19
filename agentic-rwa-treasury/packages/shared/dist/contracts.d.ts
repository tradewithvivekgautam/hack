export declare const erc20Abi: readonly [{
    readonly name: "name";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "symbol";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "decimals";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint8";
    }];
}, {
    readonly name: "totalSupply";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "balanceOf";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "account";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "allowance";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }, {
        readonly type: "address";
        readonly name: "spender";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "approve";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "spender";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "transfer";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "to";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}];
export declare const mockUsdcAbi: readonly [{
    readonly name: "name";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "symbol";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "decimals";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint8";
    }];
}, {
    readonly name: "totalSupply";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "balanceOf";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "account";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "allowance";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }, {
        readonly type: "address";
        readonly name: "spender";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "approve";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "spender";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "transfer";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "to";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "faucet";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [];
}];
export declare const vaultAbi: readonly [{
    readonly name: "name";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "symbol";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "decimals";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint8";
    }];
}, {
    readonly name: "totalSupply";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "balanceOf";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "account";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "allowance";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }, {
        readonly type: "address";
        readonly name: "spender";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "approve";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "spender";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "transfer";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "to";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "asset";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "address";
    }];
}, {
    readonly name: "totalAssets";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "convertToAssets";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "shares";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "assets";
    }];
}, {
    readonly name: "convertToShares";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "assets";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "shares";
    }];
}, {
    readonly name: "previewDeposit";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "assets";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "shares";
    }];
}, {
    readonly name: "previewMint";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "shares";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "assets";
    }];
}, {
    readonly name: "previewWithdraw";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "assets";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "shares";
    }];
}, {
    readonly name: "previewRedeem";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "shares";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "assets";
    }];
}, {
    readonly name: "maxDeposit";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "receiver";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "assets";
    }];
}, {
    readonly name: "maxMint";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "receiver";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "shares";
    }];
}, {
    readonly name: "maxWithdraw";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "assets";
    }];
}, {
    readonly name: "maxRedeem";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "shares";
    }];
}, {
    readonly name: "deposit";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "assets";
    }, {
        readonly type: "address";
        readonly name: "receiver";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "shares";
    }];
}, {
    readonly name: "mint";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "shares";
    }, {
        readonly type: "address";
        readonly name: "receiver";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "assets";
    }];
}, {
    readonly name: "withdraw";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "assets";
    }, {
        readonly type: "address";
        readonly name: "receiver";
    }, {
        readonly type: "address";
        readonly name: "owner";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "shares";
    }];
}, {
    readonly name: "redeem";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "shares";
    }, {
        readonly type: "address";
        readonly name: "receiver";
    }, {
        readonly type: "address";
        readonly name: "owner";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "assets";
    }];
}, {
    readonly name: "strategyAdapter";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "index";
    }];
    readonly outputs: readonly [{
        readonly type: "address";
    }];
}, {
    readonly name: "targetWeights";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint16[3]";
    }];
}, {
    readonly name: "currentWeights";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint16[3]";
    }];
}, {
    readonly name: "strategyAssets";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256[3]";
    }];
}, {
    readonly name: "strategyApys";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint32[3]";
    }];
}, {
    readonly name: "weightedApyBps";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "lastRebalanceAt";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint64";
    }];
}, {
    readonly name: "paused";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "adaptersReady";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
}, {
    readonly name: "pause";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
}, {
    readonly name: "unpause";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
}, {
    readonly name: "emergencyExitStrategy";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "index";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "recovered";
    }];
}, {
    readonly name: "rebalance";
    readonly type: 'function';
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly type: "uint16[3]";
        readonly name: "proposedWeights";
    }, {
        readonly type: "bytes32";
        readonly name: "reasoningHash";
    }, {
        readonly type: "string";
        readonly name: "reasoningCid";
    }];
    readonly outputs: readonly [{
        readonly type: "uint256";
        readonly name: "decisionEpoch";
    }];
}, {
    readonly name: "Deposit";
    readonly type: 'event';
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "sender";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "owner";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "assets";
    }, {
        readonly type: "uint256";
        readonly name: "shares";
    }];
}, {
    readonly name: "Withdraw";
    readonly type: 'event';
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "sender";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "receiver";
        readonly indexed: true;
    }, {
        readonly type: "address";
        readonly name: "owner";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "assets";
    }, {
        readonly type: "uint256";
        readonly name: "shares";
    }];
}, {
    readonly name: "Rebalanced";
    readonly type: 'event';
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "epoch";
        readonly indexed: true;
    }, {
        readonly type: "uint16[3]";
        readonly name: "previousWeights";
    }, {
        readonly type: "uint16[3]";
        readonly name: "newWeights";
    }, {
        readonly type: "bytes32";
        readonly name: "reasoningHash";
        readonly indexed: true;
    }, {
        readonly type: "string";
        readonly name: "reasoningCid";
    }, {
        readonly type: "address";
        readonly name: "agent";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "totalAssets";
    }];
}, {
    readonly name: "EmergencyStrategyExit";
    readonly type: 'event';
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "strategyIndex";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "assetsRecovered";
    }];
}];
export declare const policyAbi: readonly [{
    readonly name: "maxWeightBps";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint16";
    }];
}, {
    readonly name: "maxTurnoverBps";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint16";
    }];
}, {
    readonly name: "cooldownSeconds";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint32";
    }];
}, {
    readonly name: "turnoverBps";
    readonly type: 'function';
    readonly stateMutability: "pure";
    readonly inputs: readonly [{
        readonly type: "uint16[3]";
        readonly name: "currentWeights";
    }, {
        readonly type: "uint16[3]";
        readonly name: "proposedWeights";
    }];
    readonly outputs: readonly [{
        readonly type: "uint16";
    }];
}, {
    readonly name: "validate";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint16[3]";
        readonly name: "currentWeights";
    }, {
        readonly type: "uint16[3]";
        readonly name: "proposedWeights";
    }, {
        readonly type: "uint64";
        readonly name: "lastRebalanceAt";
    }];
    readonly outputs: readonly [];
}];
export declare const registryAbi: readonly [{
    readonly name: "epoch";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "decision";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "decisionEpoch";
    }];
    readonly outputs: readonly [{
        readonly type: 'tuple';
        readonly components: readonly [{
            readonly type: "uint64";
            readonly name: "timestamp";
        }, {
            readonly type: "uint16[3]";
            readonly name: "weights";
        }, {
            readonly type: "bytes32";
            readonly name: "reasoningHash";
        }, {
            readonly type: "string";
            readonly name: "reasoningCid";
        }, {
            readonly type: "address";
            readonly name: "agent";
        }, {
            readonly type: "uint256";
            readonly name: "totalAssets";
        }];
    }];
}, {
    readonly name: "DecisionRecorded";
    readonly type: 'event';
    readonly inputs: readonly [{
        readonly type: "uint256";
        readonly name: "epoch";
        readonly indexed: true;
    }, {
        readonly type: "uint64";
        readonly name: "timestamp";
    }, {
        readonly type: "uint16[3]";
        readonly name: "weights";
    }, {
        readonly type: "bytes32";
        readonly name: "reasoningHash";
        readonly indexed: true;
    }, {
        readonly type: "string";
        readonly name: "reasoningCid";
    }, {
        readonly type: "address";
        readonly name: "agent";
        readonly indexed: true;
    }, {
        readonly type: "uint256";
        readonly name: "totalAssets";
    }];
}];
export declare const strategyAdapterAbi: readonly [{
    readonly name: "asset";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "address";
    }];
}, {
    readonly name: "vault";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "address";
    }];
}, {
    readonly name: "name";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "string";
    }];
}, {
    readonly name: "totalAssets";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
}, {
    readonly name: "apyBps";
    readonly type: 'function';
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly type: "uint32";
    }];
}];
//# sourceMappingURL=contracts.d.ts.map