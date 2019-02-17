pragma solidity >=0.4.22 <0.6.0;
import './MemberBoard.sol';
/*
Note 1
In response to Europe Union - General Data Protection Regulation (GDPR), 
use hashed ID to reference any personel

Note 2 From NIST 
Report on Post-Quantum Cryptography
https://csrc.nist.gov/publications/detail/nistir/8105/final
Under threat of quantum computing,
we should not store asymetric encrypted cipher inside public blockchain
Instead, symmetric encrypted cipher or hash are still acceptable.
*/
contract crystalCrowdFundFactory{
    
}

contract crystalCrowdFund{
     //investor should be in member board before joining
    MemberBoard memberBoard;
    
    bytes32 public FundRaiserHashID;
    bytes32 public salt;

    //Events
    event Created(address _contractAddress, address _from);

    constructor() public{
        address sender = msg.sender;
        salt=keccak256(abi.encode(block.difficulty,now));
        FundRaiserHashID=gethashID(sender);
        emit Created(address(this), sender);
    }
    //Symmetic key for investor communication
    struct symKeyRecord{
        bytes32 hashID;
        uint date;
    }
    
    symKeyRecord[] public investorSymKeyRecords;
    
    
    
    modifier restrictedFundRaiser(){
        bytes32 requestor = gethashID(msg.sender);
        require(requestor==FundRaiserHashID,"Only Fund Raiser can access");
        _;
    }
    
    function transfer(address A, address B) public{
        
    }
    
    function gethashID(address name) public view returns (bytes32){
        return keccak256(abi.encode(salt, name));
    } 
}


