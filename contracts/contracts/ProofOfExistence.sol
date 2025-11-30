// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ProofOfExistence
 * @dev A simple contract to prove the existence of data at a specific time
 * Uses events for gas-efficient storage and immutable proof logging
 * Enhanced with creator name storage for better security and transparency
 */
contract ProofOfExistence {
    // Event emitted when a proof is created
    event ProofCreated(
        bytes32 indexed dataHash,
        address indexed creator,
        string creatorName,
        uint256 timestamp,
        uint256 blockNumber
    );

    // Mapping to check if a hash has been proven (optional for quick lookups)
    mapping(bytes32 => bool) public proofExists;
    
    // Mapping to store the timestamp when proof was created
    mapping(bytes32 => uint256) public proofTimestamp;
    
    // Mapping to store the creator name for each proof
    mapping(bytes32 => string) public proofCreatorName;

    /**
     * @dev Creates a proof of existence for the given data hash with creator name
     * @param _dataHash SHA-256 hash of the data to prove
     * @param _creatorName Name of the person creating the proof
     */
    function createProof(bytes32 _dataHash, string memory _creatorName) external {
        require(_dataHash != bytes32(0), "Invalid hash");
        require(bytes(_creatorName).length > 0, "Creator name cannot be empty");
        require(bytes(_creatorName).length <= 100, "Creator name too long");
        require(!proofExists[_dataHash], "Proof already exists");

        // Mark proof as existing
        proofExists[_dataHash] = true;
        proofTimestamp[_dataHash] = block.timestamp;
        proofCreatorName[_dataHash] = _creatorName;

        // Emit event for immutable logging
        emit ProofCreated(
            _dataHash,
            msg.sender,
            _creatorName,
            block.timestamp,
            block.number
        );
    }

    /**
     * @dev Checks if a proof exists for the given hash
     * @param _dataHash The hash to check
     * @return exists Whether the proof exists
     * @return timestamp When the proof was created (0 if doesn't exist)
     * @return creatorName Name of the creator (empty if doesn't exist)
     */
    function verifyProof(bytes32 _dataHash) 
        external 
        view 
        returns (bool exists, uint256 timestamp, string memory creatorName) 
    {
        exists = proofExists[_dataHash];
        timestamp = proofTimestamp[_dataHash];
        creatorName = proofCreatorName[_dataHash];
    }

    /**
     * @dev Get the timestamp when a proof was created
     * @param _dataHash The hash to check
     * @return The timestamp when proof was created (0 if doesn't exist)
     */
    function getProofTimestamp(bytes32 _dataHash) 
        external 
        view 
        returns (uint256) 
    {
        return proofTimestamp[_dataHash];
    }

    /**
     * @dev Get the creator name for a proof
     * @param _dataHash The hash to check
     * @return The creator name (empty if doesn't exist)
     */
    function getProofCreatorName(bytes32 _dataHash) 
        external 
        view 
        returns (string memory) 
    {
        return proofCreatorName[_dataHash];
    }
}