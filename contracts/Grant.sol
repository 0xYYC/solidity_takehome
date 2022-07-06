//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./ERC20.sol";

contract Grant {
    
    mapping(address => bool) public funders;
    mapping(address => uint256) public DepositedBalanceOf;
    uint256 public totalDeposited;
    bool public claimed;

    address recipient;
    ERC20   erc20;
    
    uint256 public timeLock = block.timestamp + 1 * 365 days;

    modifier onlyFunder{
        require(funders[msg.sender],"Not a funder");
        _;
    }

    modifier onlyRecipient{
        require(msg.sender == recipient,"Not a recipient");
        _;
    }


    constructor(ERC20 _erc20Address){
        erc20 = ERC20(_erc20Address); 
        recipient = msg.sender;    
    }

    function deposit(uint256 _amount) external {
        require(_amount > 0 ,"Not enought amount to deposit");
        erc20.transferFrom(msg.sender,address(this),_amount);
        funders[msg.sender] = true;
        DepositedBalanceOf[msg.sender] += _amount;
        totalDeposited += _amount; 
    }

    function remove() external onlyFunder{
        require( block.timestamp < timeLock,"late to remove");

        uint256 amount = DepositedBalanceOf[msg.sender];


        funders[msg.sender] = false;
        totalDeposited -= amount;
        DepositedBalanceOf[msg.sender] = 0;  
        
        erc20.transferFrom(address(this), msg.sender, amount);
        
    }

    function claim() external onlyRecipient{
        require( block.timestamp >= timeLock,"Not pass the timelock yet");
        require( !claimed,"Already claimed");
        require( totalDeposited > 0,"Not enough balance to claim");

        erc20.transferFrom(address(this), msg.sender, totalDeposited);

        claimed = true;

    }
    



    
}
