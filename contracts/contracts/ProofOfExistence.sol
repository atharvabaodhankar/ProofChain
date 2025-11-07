// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ProofOfExistence
 * @dev A simple contract to prove the existence of data at a specific time
 * Uses events for gas-efficient storage and immutable proof logging
 */
contract ProofOfExistence {
    // Event emitted when a proof is created
    event ProofCreated(
        bytes32 indexed dataHash,
        address indexed creator,
        uint256 timestamp,
        uint256 blockNumber
    );

    // Mapping to check if a hash has been proven (optional for quick lookups)
    mapping(bytes32 => bool) public proofExists;
    
    // Mapping to store the timestamp when proof was created
    mapping(bytes32 => uint256) public proofTimestamp;

    /**
     * @dev Creates a proof of existence for the given data hash
     * @param _dataHash SHA-256 hash of the data to prove
     */
    function createProof(bytes32 _dataHash) external {
        require(_dataHash != bytes32(0), "Invalid hash");
        require(!proofExists[_dataHash], "Proof already exists");

        // Mark proof as existing
        proofExists[_dataHash] = true;
        proofTimestamp[_dataHash] = block.timestamp;

        // Emit event for immutable logging
        emit ProofCreated(
            _dataHash,
            msg.sender,
            block.timestamp,
            block.number
        );
    }

    /**
     * @dev Checks if a proof exists for the given hash
     * @param _dataHash The hash to check
     * @return exists Whether the proof exists
     * @return timestamp When the proof was created (0 if doesn't exist)
     */
    function verifyProof(bytes32 _dataHash) 
        external 
        view 
        returns (bool exists, uint256 timestamp) 
    {
        exists = proofExists[_dataHash];
        timestamp = proofTimestamp[_dataHash];
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
}