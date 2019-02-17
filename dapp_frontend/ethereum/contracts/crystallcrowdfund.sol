pragma solidity >=0.4.22 <0.6.0;

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
    constructor() public{
        salt=keccak256(abi.encode(block.difficulty,now));
        FundRaiserHashID=gethashID(msg.sender);
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


contract MemberBoard{
    //In response to General Data Protection Regulation (GDPR), 
    //use hashID to reference member
    struct Member{
        bytes32 hashID;
        int credit;
    }
    address public myManager;
    mapping (bytes32=>uint) public memberMap;
    Member[] public memberList;
    bytes32 public salt;
    
    function gethashID(address name) public view returns (bytes32){
        return keccak256(abi.encode(salt, name));
    } 
    
    constructor() public{
        myManager=msg.sender;
        salt=keccak256(abi.encode(block.difficulty,now));
    }
    modifier restrictedmgr(){
        require(msg.sender==myManager,"Only manager can access");
        _;
    }
    
    function addMember(address name, int _credit) public restrictedmgr{
        bytes32 _hashID=gethashID(name);
        
        require(memberMap[_hashID]==0," has been registered once");
        Member memory m = Member(
           {
               hashID:_hashID,
               credit:_credit
           } 
        );
        
        memberList.push(m);
        uint inx = memberList.length;
        memberMap[_hashID]=inx;
    }
    
    function getMember (address name ) public view returns (uint){
        bytes32 hashID = gethashID(name);
        uint inx = memberMap[hashID];
        require(inx>0,"Not found the member");
        return inx-1;
    }
    
    function updateMemberCredit(address name, int creditChange) public restrictedmgr returns (int ) {
        uint inx = getMember(name);
        Member storage m = memberList[inx];
        
        return m.credit+=creditChange;
        
    }
}