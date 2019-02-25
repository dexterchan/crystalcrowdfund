pragma solidity >=0.4.22 <0.6.0;
library utility {
    function gethashID(bytes32 salt, address id) public  pure returns (bytes32){
        return keccak256(abi.encode(salt, id));
    }
    
    function gethashString(bytes32 salt, string memory str) public pure returns (bytes32){
        return keccak256(abi.encode(salt, str));
    } 
    function getSalt() public view returns (bytes32){
        return keccak256(abi.encode(block.difficulty,now));
    }
}