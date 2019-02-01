pragma solidity >=0.4.22 <0.6.0;

/*
Note 1
In response to General Data Protection Regulation (GDPR), 
use hashed username to reference any personel

Note 2 From NIST 
Report on Post-Quantum Cryptography
https://csrc.nist.gov/publications/detail/nistir/8105/final
Under threat of quantum computing,
we should not store asymetric encrypted cipher inside public blockchain
Instead, symmetric encrypted cipher or hash are still acceptable.
*/



contract MemberBoard{
    //In response to General Data Protection Regulation (GDPR), 
    //use hashname to reference member
    struct Member{
        bytes32 hashname;
        int credit;
    }
    address public myManager;
    mapping (bytes32=>uint) public memberMap;
    Member[] public memberList;
    bytes32 public salt;
    
    function getHashName(string memory name) public view returns (bytes32){
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
    
    function addMember(bytes32  _hashname, int _credit) public restrictedmgr{
        require(memberMap[_hashname]==0," has been registered once");
        Member memory m = Member(
           {
               hashname:_hashname,
               credit:_credit
           } 
        );
        
        memberList.push(m);
        uint inx = memberList.length;
        memberMap[_hashname]=inx;
    }
    
    function getMember (bytes32 m ) public view returns (uint){
        uint inx = memberMap[m];
        require(inx>0,"Not found the member");
        return inx-1;
    }
    
    
    function updateMemberCredit(bytes32 m, int creditChange) public restrictedmgr returns (int ) {
        uint inx = getMember(m);
        Member storage m = memberList[inx];
        
        return m.credit+=creditChange;
        
    }
}