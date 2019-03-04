pragma solidity ^0.5.0;

import "./MyToken.sol";

contract TokenInteraction {

    address public tokenAddress;
    address public owner;
    constructor(address _tokenAdd) public {
        owner=msg.sender;
        tokenAddress = _tokenAdd;
    }

    function transferToken(address to) public restrictOwner {
        MyToken myToken = MyToken(tokenAddress);
        myToken.transfer(to, 1);
    }

    modifier restrictOwner(){
        require(owner==msg.sender,"owner required");
            _;
    }

    function deposit(uint amt) public {
        MyToken myToken = MyToken(tokenAddress);
        myToken.transfer(address(this), amt);
    }

    function checkBalance(address c) public view returns (uint){
        MyToken myToken = MyToken(tokenAddress);
        return myToken.balanceOf(c);
    }

}