import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import truncateEthAddress from 'truncate-eth-address'
import Panda from './Panda.json';


const DepositMade = (props) => {
    console.log("DepositMade rendered")
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(props.CONTRACT_ADDRESS, Panda.abi, provider);
        
        contract.on("DepositMade", async (game, round, originator, value, stake) => {
            game = Number(game.toString());
            round = Number(round.toString());
            originator = truncateEthAddress(originator.toString());
            value = ethers.formatEther(value.toString());
            stake = ethers.formatEther(stake.toString());
            setHistory(prevHistory => {
                const newTransactionData = [game, round, originator, value, stake];
                // WORKAROUND:
                // `DepositMade` is rendered 3 times, resulting in the same TX being saved to the array 3 times
                // I couldn't fix this. The code below accepts prevents adding duplicates to the array
                const existingTransactions = new Set(prevHistory.map(item => item.join(",")));
                if (round === props.ROUND_LIMIT) {
                    return [];
                } else if (existingTransactions.has(newTransactionData.join(","))) {
                    return prevHistory;
                } else {
                    return [...prevHistory, newTransactionData];
                }
            });
        });
    
        return () => {
            contract.removeAllListeners("DepositMade");
        }
    }, []);
        
    return (
        <div>
            {/* <p >⏱️ Live transactions:</p> */}
            {history
                .sort((a, b) => b[1] - a[1]) // sort by round in descending order
                .map((item, index) => (
                    
                    <div key={index}>
                        <div className='tx-history-wrapper'>
                            <div className='tx-history-box'>
                                <p>{item[1]}</p>
                            </div>
                            <div className='tx-history-box'>
                                <p>{item[2]}</p>
                            </div>
                            <div className='tx-history-box'>
                                <p>{Number(item[3]).toFixed(4)} ETH</p>
                            </div>
                            <div className='tx-history-box'>
                                <p>{Number(item[4]).toFixed(4)} ETH</p>
                            </div>            
                        </div>
                    </div>

                ))
            }
        </div>
    );
};
      

export default DepositMade
