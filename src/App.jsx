import { useState, useEffect } from 'react'
import { ethers, formatEther, parseEther } from "ethers";
import truncateEthAddress from 'truncate-eth-address'
import Panda from './Panda.json';
import DepositMade from './DepositMade';
import TxHistory from './TxHistory';
import './App.css'

function App() {

  const CONTRACT_ADDRESS = '0x9BD190417C54516948b95fC159d0FE36C40B71D2';
  const ROUND_LIMIT = 5;

  const [game, setGame] = useState({
    id: null,
    round: null,
    stake: null,
    topDepositor: null,
    topDeposit: null,
    minValue: null,
    lastWinner: null
  });

  // Check if 'wallet' is defined in localStorage, return it or set to null
  const [wallet, setWallet] = useState(() => {
    const wallet = localStorage.getItem('wallet');
    return wallet !== 'undefined' ? JSON.parse(wallet) : {
      address: null,
      balance: null
    }
  });

  // Check if 'isConnected' is defined in localStorage, return it or set to null
  const [isConnected, setIsConnected] = useState(() => {
    const isConnected = localStorage.getItem('isConnected');
    return isConnected !== null ? JSON.parse(isConnected) : null; // Not 100% sure this state is saved/read correctly
  });


  // Show & hide the Rules
  const [rulesHidden, setRulesHidden] = useState(false);

  const rulesHiddenToggle = () => {
    setRulesHidden(!rulesHidden);
  }

  const connectToMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      // Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'});
      // Set up wallet address & balance
      const address = accounts[0];
      const balance = await provider.getBalance(address);
      setWallet({
        address: address,
        balance: ethers.formatEther(balance)
      });
      // Set up 'isConnected' state & save it to localStorage
      setIsConnected(true);
    } else {
      console.log('Please install MetaMask')

    }
  };

  const disconnectFromMetaMask = () => {
    setIsConnected(false);
    setGame({
      id: null,
      round: null,
      stake: null,
      topDepositor: null,
      topDeposit: null,
      minValue: null,
      lastWinner: null
    });
  }

  // Make a deposit

  const [depositValue, setDepositValue] = useState(0.001);

  const handleValueChange = (event) => {
    const newValue = event.target.value;
    setDepositValue((Math.ceil(newValue * 1000) / 1000).toString());
  };

  const handleIncrement = () => {
    setDepositValue((prevValue) => (prevValue - 0 + 1).toString());
  };

  const handleDecrement = () => {
    setDepositValue((prevValue) => (prevValue - 1).toString());
  };

  const makeDeposit = async () => {
    event.preventDefault();
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, Panda.abi, signer);
    try {
      const response = await contract.deposit({value: ethers.parseEther(depositValue).toString()});
      console.log("response: ", response);
    } catch (err) {
      console.log("error: ", err);
      }
    }
  }

  const fetchContractData = async () => {
    if (isConnected) {
      // Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, Panda.abi, signer);
      // Set up wallet balance
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts'});
      const address = accounts[0];
      const balance = await provider.getBalance(address);
      try {
        const game_result = await contract.whatGame();
        const round_result = await contract.whatRound();
        const stake_result = await contract.whatStake();
        const min_value_result = await contract.whatMinValue();
        const last_winner_result = await contract.whoLastWinner();
        const top_depositor_result = await contract.whoTopDepositor();
        const top_deposit_result = await contract.whatTopDeposit();
        setGame({
          id: game_result,
          round: round_result,
          stake: stake_result,
          topDepositor: top_depositor_result,
          topDeposit: top_deposit_result,
          minValue: ethers.formatEther(min_value_result),
          lastWinner: last_winner_result
        });
        setWallet(prevWallet => ({
          ...prevWallet,
          balance: ethers.formatEther(balance.toString())
        }));
        setDepositValue(ethers.formatEther(min_value_result));
      } catch (err) {
        console.log("error: ", err);
      }
    }
  }

  const listenToEvents = async () =>{
    // Connect to MetaMask
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, Panda.abi, signer);
    // Update 'game.id' and 'game.round' upon an event to refresh other data with useEffect
    contract.on("DepositMade", (game, round) => {
        setGame(prevGame => ({
          ...prevGame,
          id: game,
          round: round
        }));
  })}

  // Save the 'isConnected' (and 'wallet') state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isConnected', JSON.stringify(isConnected));
    localStorage.setItem('wallet', JSON.stringify(wallet));
    if (isConnected) {
      fetchContractData();
      listenToEvents();
    }
  }, [isConnected, game.round]);

  // console.log("game.minValue: " + game.minValue)
  // console.log("depositValue: " + depositValue)

  return (

    <div>

      <header>
        <div className="menu-top">
        {isConnected ?
          (<button onClick={disconnectFromMetaMask} className="connectWallet">
             {(truncateEthAddress(wallet.address.toString()))}
          </button>)
          :
          (<button onClick={connectToMetaMask} className="connectWallet">
             Connect your wallet
          </button>)
          }
        <a href="https://etherscan.io/"><img src="etherscan.png" alt="Etherscan" className="ethscan"></img></a>
        <a href="https://redpandanetwork.org/Donate"><p className="menu">♥</p></a>
        <a href="#about" onClick={rulesHiddenToggle}><p className="menu">?</p></a>
        </div>
        <div className="title" >Cheeky Red Panda</div>
        <img src="redpanda.png" alt="Cheeky Red Panda" className="redpanda"></img>
      </header>

      <main>
      {rulesHidden ? (
      <div className='rules-container'>
        
        <p className="rule-title" id="about">🕹️ About the game</p>
        <div className="rule-box">
        <p className="rule">Get ready to play Red Cheeky Panda, the exciting Ethereum-based game that anyone can join! Make a deposit and compete to become the top depositor, but watch out for the Cheeky Red Panda's unpredictable twists that add to the excitement.<br /><br />Come and have a blast!</p>
        </div>
        <p className="rule-title" id="rules">🎯 The rules are simple!</p>
        <div className="rule-box">
        <p className="rule-point">1</p>
        <p className="rule">Join the fun game by making a deposit! Anyone can play</p>
        <br />
        <p className="rule-point">2</p>
        <p className="rule">Deposit the most ETH and win big - game on!</p>
        <br />
        <p className="rule-point">3</p>
        <p className="rule">Fifteen deposits, one exciting round! Join now and experience the thrill.</p>
        <br />
        <p className="rule-point">4</p>
        <p className="rule">The smart contract delivers the prize to the lucky winner instantly, hassle-free!
        </p>
        <br />
        <p className="rule-point">5</p>
        <p className="rule">Good luck & have fun!</p>
        </div>

      </div>
      ): null}
      <div className="wrapper">
        <div className="box">
          <p className="rule-title">🕹️ Game</p>
          <div className="content-box">
            <p className="rule">
              {
              isConnected && game.id == 0
              ? 0
              : isConnected && game.id
              ? `${game.id.toString()}`
              : ("?")
              }  
            </p>
          </div>
        </div>
        <div className="box">
          <p className="rule-title">🎲 Round</p>
          <div className="content-box">
            <p className="rule">
              {
              isConnected && game.round == 0
              ? `0 / ${ROUND_LIMIT}`
              : isConnected && game.round
              ? `${game.round.toString()} / ${ROUND_LIMIT}`
              : ("?")
              }
              </p>
          </div>
        </div>
      </div>

      <div className="wrapper">
        <div className="box">
          <p className="rule-title">💰 Stake</p>
          <div className="content-box">
            <p className="rule">{isConnected && game.stake ? (parseFloat(ethers.formatEther(game.stake.toString())).toFixed(4) + " ETH") : ("?")}</p>
          </div>
        </div>
      <div className="box">
        <p className="rule-title">💲 Min. deposit</p>
        <div className="content-box">
          <p className="rule">
            {
            isConnected && game.minValue
            ? (game.minValue + " ETH")
            : ("?")
            }
            </p>
        </div>
       </div>
      </div>

      <div className="wrapper">
        <div className="box">
          <p className="rule-title">🥇 Leader</p>
          <div className="content-box">
            <p className="rule">
              {
              isConnected && game.topDepositor === '0x0000000000000000000000000000000000000000'
              ? "—" 
              : isConnected && game.topDepositor ? truncateEthAddress(game.topDepositor.toString())
              : "?"
              }
            </p>
          </div>
        </div>
        <div className="box">
          <p className="rule-title">💵 Top deposit</p>
          <div className="content-box">
            <p className="rule">
            {
            isConnected && game.topDeposit == 0
            ? "—" 
            : isConnected && game.topDeposit
            ? (parseFloat(ethers.formatEther(game.topDeposit.toString())).toFixed(4)) + " ETH"
            : "?"
            }  
            </p>
          </div>
        </div>
      </div>

      <div className="wrapper">
        <div className="box">
          <p className="rule-title">🏆 Last winner</p>
          <div className="content-box">
            <p className="rule">
              {
              isConnected && game.lastWinner === '0x0000000000000000000000000000000000000000'
              ? "—" 
              : isConnected && game.lastWinner ? truncateEthAddress(game.lastWinner.toString())
              : "?"
              }
            </p>
          </div>
        </div>
        <div className="box">
          <p className="rule-title">🚀 Your wallet</p>
          <div className="content-box">
            <p className="rule">{isConnected && wallet.balance ? (Number(wallet.balance).toFixed(4) + " ETH") : ("?")}</p>
          </div>
        </div>  
      </div>

      <div>
          <p className="rule-title">🎯 It's your turn...</p>
          <div>
            {isConnected ?
            (
            <div className='deposit-box'>
            <form onSubmit={makeDeposit}>
              <label>
              <button type="button" className="button-point" onClick={handleDecrement}>-1</button>
                <input className='deposit-input'
                  type="number"
                  value={depositValue}
                  onChange={handleValueChange}
                />
                <button type="button" className="button-point" onClick={handleIncrement}>+1</button>
              </label>
              <br />
              <button type="submit" className="makeDeposit">Make a deposit</button>
            </form>
            </div>
            )
            :
            (         
            <div className='wallet-container '>
            <button onClick={connectToMetaMask} className="makeDeposit">
              Connect your wallet
            </button>
            </div>
            )
            }
          </div>
        </div>


      <p className="rule-title">🔥 Deposit history</p>
      
      <div className="content-box-one-item">
        <div className='tx-history-wrapper'>
          <div className='tx-history-box'>
            <p>Round</p>
          </div>
          <div className='tx-history-box'>
            <p>Player</p>
          </div>
          <div className='tx-history-box'>
            <p>Deposit</p>
          </div>
          <div className='tx-history-box'>
            <p>Stake</p>
          </div>            
        </div>
        < br/>
        <div className="rule">{isConnected ? <DepositMade CONTRACT_ADDRESS={CONTRACT_ADDRESS} ROUND_LIMIT={ROUND_LIMIT}/> : "?"}</div>
        <div className="rule">{isConnected ? <TxHistory CONTRACT_ADDRESS={CONTRACT_ADDRESS} ROUND_LIMIT={ROUND_LIMIT} game={game.id}/> : null}</div>
      </div>
      </main>

      <footer>
        <div className="copy">
          Created with a whole lotta ❤️ by red panda enthusiasts just like you!<br /><br />
          &copy; 2023. All rights reserved.
        </div>
      </footer>

    </div>
  );
}

export default App;
