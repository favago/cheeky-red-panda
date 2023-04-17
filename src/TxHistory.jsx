import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import truncateEthAddress from 'truncate-eth-address'
import Panda from './Panda.json';

const TxHistory = (props) => {

    const [historicalEvents, setHistoricalEvents] = useState([]);
    const game = props.game;

    const getHistoricalEvents = async () => {
        try {
            // Connect to MetaMask
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(props.CONTRACT_ADDRESS, Panda.abi, provider);
            // Apply filter
            const filter = contract.filters.DepositMade(null, null, null, null, null);
            // Get query results
            const result = await contract.queryFilter(filter, 0, "latest");
            
            setHistoricalEvents(result);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getHistoricalEvents();
    }, []);

    return (
        <div>
        {/* <p>⏳ Historical transactions:</p> */}
        {historicalEvents
        .filter(item => item.args.game === game)
        .reverse()
        .map((event, index) => (
        
            <div key={index}>
              <div className='tx-history-wrapper'>
                <div className='tx-history-box'>
                  <p>{JSON.parse(event.args.round)}</p>
                </div>
                <div className='tx-history-box'>
                  <p>{truncateEthAddress(event.args.originator.toString())}</p>
                </div>
                <div className='tx-history-box'>
                  <p>{Number(ethers.formatEther(event.args.value.toString())).toFixed(4)} ETH</p>
                </div>
                <div className='tx-history-box'>
                  <p>{Number(ethers.formatEther(event.args.stake.toString())).toFixed(4)} ETH</p>
                </div>            
              </div>
            </div>

        ))}
        </div>
    );
};

export default TxHistory;

