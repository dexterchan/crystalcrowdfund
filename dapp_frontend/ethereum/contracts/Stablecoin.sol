pragma solidity >=0.5 <0.6.0;

import "./ERC20/ERC20.sol";

contract Stablecoin is ERC20 {
    string public  name = "Stable Coin Contract USD";
    string public  symbol = "SCUSD";

    bool public frozen;
    address public owner;
    using SafeMath for uint256;

    

    constructor(uint initial) public {
        owner=msg.sender;
        // Initially assign all tokens to the contract's creator.
        _mint(msg.sender, initial);
        frozen=false;
    }
    function frozeCoin() public restrictOwner{
        require(!frozen, "Coin frozen already");
        frozen=true;
    }
    
    modifier checkFrozen(){
            require(!frozen,"Coin is frozen");
            _;
    }
  
    modifier restrictOwner(){
        require(owner==msg.sender,"Only owner allowed");
            _;
    }
  
     

   

    

    /**
     * @dev Transfer token to a specified address
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function transfer(address to, uint256 value) public checkFrozen returns (bool) {
        require((value > 0  && balanceOf(msg.sender) > value), "Return false if specified value is less than the balance available");

        _transfer(msg.sender, to, value);
        return true;
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * Beware that changing an allowance with this method brings the risk that someone may use both the old
     * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
     * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     */
    function approve(address spender, uint256 value) public checkFrozen returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev Transfer tokens from one address to another.
     * Note that while this function emits an Approval event, this is not required as per the specification,
     * and other compliant implementations may not emit the event.
     * @param from address The address which you want to send tokens from
     * @param to address The address which you want to transfer to
     * @param value uint256 the amount of tokens to be transferred
     */
    function transferFrom(address from, address to, uint256 value) public checkFrozen returns (bool) {
        _transfer(from, to, value);
        _approve(from, msg.sender, get_allowed(from,msg.sender).sub(value));
        return true;
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     * approve should be called when _allowed[msg.sender][spender] == 0. To increment
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * Emits an Approval event.
     * @param spender The address which will spend the funds.
     * @param addedValue The amount of tokens to increase the allowance by.
     */
    function increaseAllowance(address spender, uint256 addedValue) checkFrozen public returns (bool) {
        _approve(msg.sender, spender, get_allowed(msg.sender,spender).add(addedValue));
        return true;
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     * approve should be called when _allowed[msg.sender][spender] == 0. To decrement
     * allowed value is better to use this function to avoid 2 calls (and wait until
     * the first transaction is mined)
     * From MonolithDAO Token.sol
     * Emits an Approval event.
     * @param spender The address which will spend the funds.
     * @param subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) checkFrozen public returns (bool) {
        _approve(msg.sender, spender, get_allowed(msg.sender,spender).sub(subtractedValue));
        return true;
    }
    
}