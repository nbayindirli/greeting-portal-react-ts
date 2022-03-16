import { ALL_EMOJIS } from "./emojis";
import { CHAINS } from "./idsToChains";

export function formatString(s: string, ...v: string[]): string {
    for (let i = 0; i < v.length; i++) {
        s = s.replace(`{${i}}`, v[i]);
    }
    return s;
};

export function getAccountShorthand(currentAccount: string): string {
    const currentAccountPrefix = currentAccount.substring(0, 4);
    const currentAccountSuffix = currentAccount.substring(
        currentAccount.length - 4, currentAccount.length
    );

    return `${currentAccountPrefix}...${currentAccountSuffix}`;
};

export function delay(ms: number): Promise<any> {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
};

export function getRandomIcon() {
    return `${ALL_EMOJIS[randomInteger(0, ALL_EMOJIS.length - 1)]}`;
};

export function randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

export function hexStringToBalance(balanceHexString: string) {
    const balanceString = hexStringToNumber(balanceHexString) / (10 ** 18);

    const balance: number = +balanceString.toFixed(4)

    return balance;
};

export function chainIdHexToNetworkName(chainIdHexString: string): string {
    return CHAINS[hexStringToNumber(chainIdHexString)];
};

export function hexStringToNumber(hex: string): number {
    return parseInt(hex, 16) as number;
};
