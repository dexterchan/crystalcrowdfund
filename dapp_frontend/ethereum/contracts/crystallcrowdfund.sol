pragma solidity >=0.4.22 <0.6.0;
import './MemberBoard.sol';
import './utility.sol';
import './StablecoinV3.sol';
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

contract CrystalCrowdFundFactory{
    MemberBoard memberBoard;
    address public myManager;
    bytes32 public salt;
    CrystalCrowdFund[] public deployedFunds;
    
    constructor(MemberBoard _m) public{
        myManager=msg.sender;
        //**********************************************************************
        //Don't run the library to get salt, it will consume large amount of gas
        //salt = utility.getSalt();
        //**********************************************************************
        salt=keccak256(abi.encode(block.difficulty,now));
        memberBoard=_m;
    }
    
    function createFund(
        StablecoinV3 _moneyPool
        ,address _fundRaiser
        ,string memory _abstract
        , string memory _url
        ,bytes32 _dochash
        , bytes32 symmetricKeyHashCode
        ) public returns(CrystalCrowdFund){
        
        require(memberBoard.getMember(msg.sender)>=0,"Only member can access");
        require(memberBoard.getMember(_fundRaiser)>=0,"Only member can be fund raiser");
        
        CrystalCrowdFund  newFund=new CrystalCrowdFund(
            _moneyPool
            ,_fundRaiser
            ,_abstract
            ,_url
            , _dochash
            ,symmetricKeyHashCode
            );
        deployedFunds.push(newFund);
        return newFund;
    }
    function getDeployedFunds() public view returns (CrystalCrowdFund[] memory){
        return deployedFunds;
    }
    function getNumberOfFunds() public view returns (uint256){
        return deployedFunds.length;
    }
    
}

contract CrystalCrowdFund{
     //investor should be in member board before joining
    
    StablecoinV3 moneyPool;
    address public FundAdmin;
    bytes32 public FundRaiserHashID;
    bytes32 public salt;
    string public fundabstract;
    string public url;
    bytes32 public dochash;
    
    //Events
    event Created(address _contractAddress, address _from);

    constructor(
                StablecoinV3 _m
                ,address _fundRaiser
                ,string memory _abstract
                ,string memory _url
                ,bytes32 _dochash
                ,bytes32 _symkeyHashCode  
                ) public{
        moneyPool=_m;
        salt=keccak256(abi.encode(block.difficulty,now));
        FundRaiserHashID = keccak256(abi.encode(salt, _fundRaiser));
        FundAdmin= msg.sender;
        fundabstract=_abstract;
        dochash=_dochash;
        url=_url;

        SymKeyRecord memory symkey= SymKeyRecord({
            hashID:_symkeyHashCode,
            date: now}
            );
        investorSymKeyRecords.push(symkey);
        emit Created(address(this), FundAdmin);
    }
    //Symmetic key for investor communication
    struct SymKeyRecord{
        bytes32 hashID;
        uint date;
    }
    
    SymKeyRecord[] public investorSymKeyRecords;
    
    modifier restrictedFundAdmin(){
        require(FundAdmin==msg.sender,"Only Fund Admin can access");
        _;
    }
    
    modifier restrictedFundRaiser(){
        _;
    }
    
    function transfer(address A, address B) public{
        
    }
    
    function getFundAdmin() public view returns (address){
        return FundAdmin;
    }
    
    function getSymKeyRecordLength() public view returns (uint){
        return investorSymKeyRecords.length;
    }

    function depositStableCoin(uint amount) public {
        StablecoinV3(moneyPool).transfer(address(this),amount);
    }
    function getAddress() public view returns ( address){
        return address(this);
    }
    function getMyBalance() public view returns(uint256){
        return moneyPool.balanceOf( address(this));
    }
}