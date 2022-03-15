import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import { ALL_EMOJIS } from './util/emojis';

function App() {

    const [isInstalled, setIsInstalled] = useState(false);
    const [currentAccount, setCurrentAccount] = useState('');
    const [balance, setBalance] = useState(0);

    const walletConnected = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                console.log('Please install non-custodial wallet.');
                toast.error('Please install non-custodial wallet.', { style });
                return;
            } else {
                console.log(`Ethereum object obtained: ${ethereum}`);
                setIsInstalled(true);
            }

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length !== 0) {
                const currentAccount = accounts[0];

                const currentAccountShorthand = getAccountShorthand(currentAccount);

                console.log(`Found authorized account: ${currentAccount}`);
                toast(`Found authorized account...`, { style });
                setCurrentAccount(currentAccount);

                await delay(1000);

                console.log(`Successfully connected to ${currentAccount} (${currentAccountShorthand})`);
                toast.success(`Successfully connected to ${currentAccountShorthand}`, { style });
            } else {
                console.log('No authorized account found.');
            }
        } catch (error) {
            toast.error('Failed to connect to wallet.', { style });
            console.log(error);
        }
    };

    const connectWallet = async () => {
        const id = toast.loading('Connecting to wallet...', { style });

        try {
            const { ethereum } = window;

            if (!ethereum) {
                console.log('Please install non-custodial wallet.');
                toast.error('Please install non-custodial wallet.', { style, id });
                return;
            } else {
                console.log(`Ethereum object obtained: ${ethereum}`);
                setIsInstalled(true);
            }

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const currentAccount = accounts[0];
            setCurrentAccount(currentAccount);

            const currentAccountShorthand = getAccountShorthand(currentAccount);

            console.log(`Successfully connected to ${currentAccount} (${currentAccountShorthand})`);
            toast.success(`Successfully connected to ${currentAccountShorthand}`, { style, id });
        } catch (error) {
            toast.error('Failed to connect to wallet.', { style, id });
            console.log(error);
        }
    };

    const getBalance = async (ethereum: any) => {
        try {
            const balanceHex = await ethereum.request({ method: 'eth_getBalance', params: [currentAccount, 'latest'] });
            const balance = hexStringToBalance(balanceHex);
            console.log(`Successfully got account balance for ${currentAccount}: ${balance}`);
            setBalance(balance);
        } catch (error) {
            console.log(error);
        }
    };

    const greet = () => {

        try {
            toast("Greetings!", {
                icon: getRandomIcon(),
                style
            });
        } catch (error) {
            toast.error("");
            console.log(error);
        }
    };

    const clearToasts = () => {
        toast.dismiss();
        toast("nom nom nom", {
            style,
            icon: '🍽'
        });
    }

    useEffect(() => {
        walletConnected();
    }, []);

    return (
        <div className='mainContainer'>

            <Toaster
                position='top-right'
                reverseOrder={true}
            />

            <div className='dataContainer'>
                <div className='header'>
                    Greetings <span role='img' aria-label='sushi'>🍣</span>
                </div>

                <div className='bio'>
                    The name's Bay. Noah Bay(indirli). Connect your wallet and greet me!
                </div>

                {
                    !currentAccount && isInstalled
                        &&
                    (
                        <button className='greetButton' onClick={connectWallet}>
                            Connect Wallet <span role='img' aria-label='flying money'>💸</span>
                        </button>
                    )
                }

                {
                    currentAccount
                        &&
                    (
                        <button className='greetButton' onClick={greet}>
                            Greet Me <span role='img' aria-label='waving hand emoji'>👋</span>
                        </button>
                    )
                }

                <button className='greetButton' onClick={clearToasts}>
                    Eat Toast <span role='img' aria-label='waving hand emoji'>🍞</span>
                </button>

                {
                    // balance > 0
                    //     &&
                    // (
                    //     <div className='balance'>
                    //         Current balance: {balance} ETH
                    //     </div>
                    // )
                }

            </div>
        </div>
    );
}

export default App;

const style = {
    borderRadius: '10px',
    background: '#333',
    color: '#fff'
};

function getAccountShorthand(currentAccount: string): string {
    const currentAccountPrefix = currentAccount.substring(0, 4);
    const currentAccountSuffix = currentAccount.substring(
        currentAccount.length - 4, currentAccount.length
    );

    return `${currentAccountPrefix}...${currentAccountSuffix}`;
};

function delay(ms: number): Promise<any> {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
};

function getRandomIcon() {
    return `${ALL_EMOJIS[randomInteger(0, ALL_EMOJIS.length - 1)]}`;
}

function randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hexStringToBalance(balanceHexString: string) {
    const balanceString = parseInt(balanceHexString, 16) / (10 ** 18);

    const balance: number = +balanceString.toFixed(4)

    return balance;
}
