// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract Panda {

    uint public game;
    uint public round;
    uint public topDeposit;
    uint public pool;
    uint public stake;

    address payable public topDepositor;

    mapping(address => uint) public balances;

    event DepositMade (uint game, uint round, address originator, uint value, uint stake);

    modifier minValue() {
        require(msg.value >= 0.001 ether);
        _;
    }

    function deposit() minValue public payable {
        round++;
        pool += msg.value;
        stake = pool * 98 / 100;
        balances[msg.sender] = msg.value;
        emit DepositMade(game, round, msg.sender, balances[msg.sender], stake);
        isTopDepositor();
        isPayday();
    }

    function isTopDepositor() private {
        if (msg.value > topDeposit) {
            topDepositor = payable(msg.sender);
            topDeposit = msg.value;
        }
    }

    function isPayday() private {
        if (round >= 5) {
            topDepositor.transfer(stake);
            newGame();
        }
    }

    function newGame() private {
        pool = 0;
        stake = 0;
        round = 0;
        topDeposit = 0;
        topDepositor = payable(address(0));
        game++;       
    }

    // TESTY

    function whatGame() public view returns (uint) {
        return game;     
    }

    function whatRound() public view returns (uint) {
        return round;     
    }

    function whatStake() public view returns (uint) {
        return stake;     
    }

    function whoTopDepositor() public view returns (address) {
        return topDepositor;     
    }

}