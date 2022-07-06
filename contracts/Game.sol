//SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./ERC20.sol";

contract Game{
    
    function transfer(ERC20 erc20Token, address recipient, uint256 amount) external{
        bool success = erc20Token.transferFrom(msg.sender, recipient, amount);
        require(success);
    }
            
}
