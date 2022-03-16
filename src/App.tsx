import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';
import FadeIn from 'react-fade-in';
import LoadingBar from 'react-top-loading-bar';
import { ethers } from 'ethers';
import GreetPortalContract from './contracts/GreetPortal.json';
import { SUPPORTED_WALLETS } from './util/supportedWallets';
import { ETHERSCAN_ADDRESS_PATH, ETHERSCAN_MAINNET_BASE_URL, ETHERSCAN_TESTNET_BASE_URL } from './util/etherscanURLs';
import style from './util/hotToastStyle';
import { chainIdHexToNetworkName, delay, formatString, getAccountShorthand, getRandomIcon, hexStringToBalance } from './util/tools';

function App() {

    const loadingBarRef = useRef(null);

    const [isInstalled, setIsInstalled] = useState(false);
    const [currentAccount, setCurrentAccount] = useState('');
    const [balance, setBalance] = useState(-1);
    const [networkName, setNetworkName] = useState('');

    const greetPortalContractAddress = '0xD45DA419Ae6c960530A7cFa2aFff84cd08B907dC';
    const greetPortalContractABI = GreetPortalContract.abi;

    const walletConnected = async function () {
        try {
            const { ethereum } = window;
            if (!ethereum) {
                console.log('No supported wallets found.');
                toast.error('No supported wallets found.', { style });
                setIsInstalled(false);
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

    const connectWallet = async function () {
        const id = toast.loading('Connecting to wallet...', { style });
        try {
            const { ethereum } = window;
            if (!ethereum) {
                console.log('Please install non-custodial wallet.');
                toast.error('Please install non-custodial wallet.', { style, id });
                setIsInstalled(false);
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

    const getBalance = async function () {
        try {
            const { ethereum } = window;
            if (!ethereum) {
                console.log('Unable to retrieve balance.');
                setBalance(-1);
                return;
            }

            const balanceHex = await ethereum.request({ method: 'eth_getBalance', params: [currentAccount, 'latest'] });
            const balance = hexStringToBalance(balanceHex);
            console.log(`Successfully got account balance for ${currentAccount}: ${balance}`);
            setBalance(balance);
        } catch (error) {
            console.log(error);
            setBalance(-1);
        }
    };

    const getNetworkName = async function () {
        try {
            const { ethereum } = window;
            if (!ethereum) {
                console.log('Unable to get network name.');
                setNetworkName('');
                return;
            }

            const networkName = chainIdHexToNetworkName(ethereum.chainId);
            console.log(`Now connected to ${networkName}.`);
            setNetworkName(networkName);
        } catch (error) {
            console.log(error);
            setNetworkName('');
        }
    };

    const clearToasts = () => {
        toast.dismiss();
        toast('nom nom nom', {
            style,
            icon: '🍽'
        });
    }

    const greet = async function () {
        staticStartLoading();

        const icon = getRandomIcon();
        const greetId = toast.loading('Attempting to greet...', { style });
        try {
            const { ethereum } = window;
            if (!ethereum) {
                console.log('Please install non-custodial wallet.');
                toast.error('Please install non-custodial wallet.', { style, id: greetId });
                return;
            }
            const greetPortalContract = await getGreetPortalContract(ethereum);

            // let greetCount = await greetPortalContract.getTotalGreetings();
            // console.log(`Retrieved total number of greetings: ${hexStringToNumber(greetCount)}`);
            // const countId = toast.loading(`Current greet count: ${greetCount}`, { style });

            const greetTxn = await greetPortalContract.greet();
            console.log(`Mining greeting (${greetTxn.hash})`);
            toast.loading(`Mining greeting (${getAccountShorthand(greetTxn.hash)})`, { style, id: greetId });

            await greetTxn.wait();

            console.log(`Greeting mined (${greetTxn.hash})!`);
            toast.success(`Greeting mined (${getAccountShorthand(greetTxn.hash)})!`, { style, id: greetId });

            // greetCount = await greetPortalContract.getTotalGreetings();
            // console.log(`Retrieved total number of greetings: ${hexStringToNumber(greetCount)}`);

            delay(1000);
            toast('Greetings!', { icon, style, id: greetId });

            // toast(`New greet count: ${greetCount}`, { icon, style, id: countId });
            
            completeLoading();
        } catch (error) {
            decreaseLoading();

            toast.error('Did not greet :/', { style, id: greetId });
            console.log(error);
        }
    };

    const getTotalGreetings = async function () {
        continuousStartLoading();

        const icon = getRandomIcon();
        try {
            const { ethereum } = window;
            if (!ethereum) {
                console.log('Please install non-custodial wallet.');
                toast.error('Please install non-custodial wallet.', { style });
                return;
            }
            const greetPortalContract = await getGreetPortalContract(ethereum);

            let greetCount = await greetPortalContract.getTotalGreetings();
            console.log(`Total greet count: ${greetCount}`);
            toast(`Total greet count: ${greetCount}`, { icon, style });

            completeLoading();
        } catch (error) {
            decreaseLoading();

            toast.error('Unable to get total greet count.', { style });
            console.log(error);
        }
    };

    const getGreetPortalContract = async function (ethereum: any) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        return new ethers.Contract(
            greetPortalContractAddress,
            greetPortalContractABI,
            signer
        );
    }

    const getNetworkLink = function (): string {
        if (networkName === '') {
            return ETHERSCAN_MAINNET_BASE_URL;
        }

        const formattedAddressPath = formatString(ETHERSCAN_ADDRESS_PATH, currentAccount);
        return networkName === 'Mainnet' ?
            formatString(
                ETHERSCAN_MAINNET_BASE_URL, formattedAddressPath
            ) :
            formatString(
                ETHERSCAN_TESTNET_BASE_URL, networkName.toLowerCase(), formattedAddressPath
            );
    }

    const continuousStartLoading = function () {
        // @ts-ignore
        loadingBarRef.current.continuousStart();
    };

    const staticStartLoading = function () {
        // @ts-ignore
        loadingBarRef.current.staticStart(10);
    };

    const decreaseLoading = function () {
        // @ts-ignore
        loadingBarRef.current.decrease(100);
    };
    
    const completeLoading = function () {
        // @ts-ignore
        loadingBarRef.current.complete();
    };
    
    useEffect(function () {
        walletConnected();

        const { ethereum } = window;

        if (ethereum) {
            ethereum.on('chainChanged', function (_chainId: any) {
                window.location.reload();
            });
            ethereum.on('accountsChanged', function () {
                window.location.reload();
            });
        }
    }, []);

    useEffect(function () {
        getBalance();
        getNetworkName();
    }, [currentAccount]);

    return (
        <div className='mainContainer'>

            <LoadingBar
                color='orange'
                ref={loadingBarRef}
            />

            <Toaster
                position='top-right'
                reverseOrder={true}
            />

            <div className='dataContainer'>

                <div className='header'>
                    {
                        isInstalled ? ('Greetings') : ('Please install a supported wallet ')
                    } <span role='img' aria-label='sushi emoji'>🍣</span>
                </div>

                {
                    isInstalled
                        ?
                    (
                        <FadeIn>
                            <div className='bio'>
                                The name's Bay. Noah Bay(indirli).
                                <br/>
                                { currentAccount ? ('Thanks for connecting. Now greet me!') : ('Connect your wallet and greet me!') }
                            </div>
                        </FadeIn>
                    )
                        :
                    (
                        <FadeIn>
                            <div className='bio'>
                                Supported wallets: <b>{SUPPORTED_WALLETS.join(', ')}</b>... that's it.
                            </div>
                        </FadeIn>
                    )
                }
                {
                    !currentAccount && isInstalled
                        &&
                    (
                        <button className='mainButton' onClick={connectWallet}>
                            Connect  Wallet <span role='img' aria-label='flying money emoji'>💸</span>
                        </button>
                    )
                }
                {
                    currentAccount
                        &&
                    (
                        <button className='mainButton' onClick={greet}>
                            Greet  Me <span role='img' aria-label='waving hand emoji'>👋</span>
                        </button>
                    )
                }
                {
                    currentAccount
                        &&
                    (
                        <button className='mainButton' onClick={getTotalGreetings}>
                            Get  Total  Greetings <span role='img' aria-label='abacus emoji'>🧮</span>
                        </button>
                    )
                }
                {
                    currentAccount
                        &&
                    (
                        <button className='mainButton' onClick={clearToasts}>
                            Eat  Toast <span role='img' aria-label='bread emoji'>🍞</span>
                        </button>
                    )
                }
                {
                    balance >= 0
                        &&
                    (
                        <FadeIn>
                            <div className='balanceText'>
                                Current balance: <a className='boringLink' href={getNetworkLink()} target="_blank">
                                    <span id='balance'><b>{balance} ETH</b></span>
                                </a> { networkName !== '' && `(on ${networkName})`} <span role='img' aria-label='money bag emoji'>💰</span>
                                <br></br>
                                <br></br>
                                <a className='boringLink' href='https://ropsten.etherscan.io/address/0xD45DA419Ae6c960530A7cFa2aFff84cd08B907dC' target="_blank">    
                                    <i>Greet Contract: 0xD45DA419Ae6c960530A7cFa2aFff84cd08B907dC</i> <span role='img' aria-label='paper emoji'>📄</span>
                                </a>
                            </div>
                        </FadeIn>
                    )
                }
            </div>
        </div>
    );
}

export default App;
