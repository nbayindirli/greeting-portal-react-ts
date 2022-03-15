interface chainIndex {
    [id: number]: /*name*/ string
};

export const CHAINS: chainIndex = {
    1: 'Mainnet',
    3: 'Ropsten',
    4: 'Rinkeby',
    5: 'Goerli',
    42: 'Kovan',
};
