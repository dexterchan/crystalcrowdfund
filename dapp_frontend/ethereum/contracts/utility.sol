library utility {
    function gethashID(bytes32 salt, address id) public view returns (bytes32){
        return keccak256(abi.encode(salt, id));
    }
    
    function gethashString(bytes32 salt, string memory str) public view returns (bytes32){
        return keccak256(abi.encode(salt, str));
    } 
    function getSalt() public view returns (bytes32){
        return keccak256(abi.encode(block.difficulty,now));
    }
}