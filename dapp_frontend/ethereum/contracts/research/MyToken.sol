pragma solidity ^0.5.0;

import "./ERC20.sol";

contract MyToken is ERC20 {
    
    bool public frozen;
    address public owner;
    constructor(uint initial) public {
        owner=msg.sender;
        // Initially assign all tokens to the contract's creator.
        _mint(msg.sender, initial);
        frozen=false;
    }
    function frozeCoin() public {
        require(owner==msg.sender,"owner required");
        require(!frozen, "Coin frozen already");
        frozen=true;
    }
  
    function freeze() public {
        require(owner==msg.sender,"owner required");
        require(!frozen, "Coin freeze");
        //the caller became the contract itself instead of end user account
        this.frozeCoin();
    }
    function freezeWithoutThis() public {
        require(owner==msg.sender,"owner required");
        require(!frozen, "Coin freeze");
        //the caller became the contract itself instead of end user account
        frozeCoin();
    }
    function transfer(address _to, uint256 _value) public restrictOwner returns (bool success) {
        _transfer(msg.sender, _to, _value);
        return true;
    }
    
    modifier restrictOwner(){
        require(owner==msg.sender,"owner required");
            _;
    }

    modifier checkFrozen(){
            require(!frozen,"Coin is frozen");
            _;
    }
  
    
  
    

    
    
    /*
    function tran (address _to, uint256 _value) public checkFrozen returns (bool success) {
        return this.transfer(_to,_value);
    }*/
    
}