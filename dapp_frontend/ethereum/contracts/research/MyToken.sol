pragma solidity ^0.5.0;

import "./ERC20.sol";

contract MyToken is ERC20 {
    
    
    constructor(uint initial) public {
        // Initially assign all tokens to the contract's creator.
        _mint(msg.sender, initial);
    }
}