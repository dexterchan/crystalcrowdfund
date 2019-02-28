pragma solidity >=0.4.22 <0.6.0;

import './StablecoinV2.sol';
// V3 - inherits from V2
// Add the admin functions * to be done
//
// This is JUST A SHELL - Students should try to implement it as an exercise on their own
//
// Refer to example admin functions below
//
// Implement the administrative functions
contract StablecoinV3 is StablecoinV2 {

  constructor(uint256 initSupply) StablecoinV2(initSupply) public {
    // constructor
    // Feel free to change the constructor
  }
/*
  function increaseSupply(uint additional) public returns (bool success) {
    // 1. Only owner can take this action
    // 2. Caller gets the ownership of additional coins
    return true;
  }

  function decreaseSupply(uint additional) public returns (bool success) {
    // 1. Only owner can take this action
    // 2. Caller's token are taken for removal
    // 3. What happens when caller does not have sufficient balance?
    return true;
  }
*/
  // Think of other admin functions you would like to implement
}
