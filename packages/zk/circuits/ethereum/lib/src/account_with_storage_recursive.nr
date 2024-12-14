use crate::account_with_storage::StorageWithinBlock;
use crate::misc::{fragment::Fragment, types::{Address, ADDRESS_LENGTH, Bytes32, BYTES32_LENGTH}};
use crate::serde::STORAGE_BLOCK_LEN;
use dep::std::{mem::zeroed, verify_proof};

struct RecursiveProof {
    key_hash: Field,
    verification_key: [Field; 114],
    proof: [Field; 93],
}

global NUM_PUBLIC_INPUTS: u32 = 1 + 1 + ADDRESS_LENGTH + BYTES32_LENGTH + STORAGE_BLOCK_LEN; // chain_id + block_number + address + storage_key + public_return_inputs

pub fn get_account_with_storage_recursive(
    chain_id: Field,
    block_number: u64,
    address: Address,
    storage_key: Bytes32,
) -> StorageWithinBlock<1> {
    let (storage_within_block, RecursiveProof { key_hash, verification_key, proof }) = get_account_with_storage_recursive_unconstrained(
        chain_id,
        block_number,
        address,
        storage_key,
    );

    let mut public_inputs: Fragment<NUM_PUBLIC_INPUTS, Field> = Fragment::empty();
    public_inputs.push_back(chain_id);
    public_inputs.push_back(block_number as Field);
    public_inputs.extend_back(address.serialize());
    public_inputs.extend_back(storage_key.serialize());
    public_inputs.extend_back(storage_within_block.serialize());

    verify_proof(
        verification_key,
        proof,
        public_inputs.to_array::<NUM_PUBLIC_INPUTS>(),
        key_hash,
    );

    storage_within_block
}

#[oracle(get_storage_recursive)]
unconstrained fn get_account_with_storage_recursive_oracle(
    chain_id: Field,
    block_number: u64,
    address: Address,
    storage_key: Bytes32,
) -> ([Field; STORAGE_BLOCK_LEN], RecursiveProof) {}

unconstrained fn get_account_with_storage_recursive_unconstrained(
    chain_id: Field,
    block_number: u64,
    address: Address,
    storage_key: Bytes32,
) -> (StorageWithinBlock<1>, RecursiveProof) {
    let (return_value_serialized, proof) =
        get_account_with_storage_recursive_oracle(chain_id, block_number, address, storage_key);
    let return_value = StorageWithinBlock::deserialize(return_value_serialized);
    (return_value, proof)
}
