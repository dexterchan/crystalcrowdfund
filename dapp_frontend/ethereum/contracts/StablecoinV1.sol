pragma solidity >=0.4.22 <0.6.0;

/**
 * Reference from
 * http://ACloudFan.com
 * 
 * Implements a simple ERC20 Token
 * V1 >> Implements simple token that does not support approve/transferFrom & allowance function
 *       This version will not be ERC20 compliant as it does not implement all specs funcs/events
 * 
 */
 //Solidity 0.5
contract StablecoinV1 {

  // 1. Declare the metadata for the coin
  //    All of thse variables declared public constant - so available as functions

  string public constant name = "Stable Coin Contract USD";
  string public constant symbol = "SCUSD";

  // Token values are passed as integers so decimals is the number of decimals from righ
  // E.g., decimals = 2, value=100 interpretted as 1.00
  // E.g., decimals = 1, value=100 interpretted as 10.0
  uint8  public constant decimals = 2;

  // 6. Declare the event
  event Transfer(address _from, address _to, uint256 _value);

  // 2. Maintain the total supply
  uint256 public totalSupply;

  // 4. Maintain the balance in a mapping
  mapping(address => uint256)  balances;

  //owner of this contract
  address public owner;
  
  //Maintain the state of frozen
  //If frozen, no transfer activities allowed except redemption
  bool public frozen;
  
  // 3. Constructor sets the initial supply as total available
  constructor (uint256 initSupply) public {
    // constructor
    owner = msg.sender;
    // Set the initial supply
    totalSupply = initSupply;

    // Set the sender as the owner of all the initial set of tokens
    // Declare the balances mapping
    balances[msg.sender] = totalSupply;
    
    
    frozen=false;
  }

  // 5. transfer
  function transfer(address _to, uint256 _value) public checkFrozen returns (bool success) {
    // Return false if specified value is less than the balance available
    require((_value > 0  && balances[msg.sender] > _value), "Return false if specified value is less than the balance available");

    // Reduce the balance by _value
    balances[msg.sender] -= _value;

    // Increase the balance of the receiever that is account with address _to
    balances[_to] += _value;

    // Declare & Emit the transfer event
    emit Transfer(msg.sender, _to, _value);

    return true;
  }

  // 7. balanceOf
  // Anyone can call this constant function to check the balance of tokens for an address
  function balanceOf(address _someone) public view returns (uint256 balance){
    return balances[_someone];
  }
  
  //8. switch for frozen
  modifier checkFrozen(){
        require(!frozen,"Coin is frozen");
        _;
  }
  
  modifier restrictOwner(){
      require(owner==msg.sender,"Only owner allowed");
        _;
  }
  
  //9. frozenCoin()
  function frozeCoin() public restrictOwner{
      require(!frozen, "Coin frozen already");
      frozen=true;
  }

  // Fallback function
  // Do not accept ethers
   function() external{
    // This will throw an exception - in effect no one can purchase the coin
    assert(true == false);
  }
}