pragma solidity >=0.4.22 <0.6.0;

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