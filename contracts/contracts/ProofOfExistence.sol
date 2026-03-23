// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProofOfExistence {

    event ProofCreated(
        bytes32 indexed dataHash,
        address indexed creator,    // this will be the Smart Account address
        string  creatorName,
        uint256 timestamp,
        uint256 blockNumber
    );

    mapping(bytes32 => bool)    public proofExists;
    mapping(bytes32 => uint256) public proofTimestamp;
    mapping(bytes32 => address) public proofCreator;
    mapping(bytes32 => string)  public proofCreatorName;

    function createProof(bytes32 _dataHash, string calldata _creatorName) external {
        require(_dataHash != bytes32(0),             "Invalid hash");
        require(bytes(_creatorName).length > 0,      "Name required");
        require(bytes(_creatorName).length <= 100,   "Name too long");
        require(!proofExists[_dataHash],             "Proof already exists");

        proofExists[_dataHash]      = true;
        proofTimestamp[_dataHash]   = block.timestamp;
        proofCreator[_dataHash]     = msg.sender;       // Smart Account address stored here
        proofCreatorName[_dataHash] = _creatorName;

        emit ProofCreated(
            _dataHash,
            msg.sender,
            _creatorName,
            block.timestamp,
            block.number
        );
    }

    function verifyProof(bytes32 _dataHash)
        external
        view
        returns (
            bool    exists,
            uint256 timestamp,
            address creator,
            string  memory creatorName
        )
    {
        return (
            proofExists[_dataHash],
            proofTimestamp[_dataHash],
            proofCreator[_dataHash],
            proofCreatorName[_dataHash]
        );
    }
}