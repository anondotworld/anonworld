use crate::misc::types::Bytes32;
use crate::account::MAX_PREFIXED_KEY_NIBBLE_LEN;
use crate::account_with_storage::{MAX_STORAGE_VALUE_LEN, MAX_STORAGE_LEAF_LEN};
use crate::merkle_patricia_proofs::proof::{ProofInput, verify_merkle_proof};

pub fn verify_storage_values<let N: u32, let MAX_STORAGE_DEPTH_NO_LEAF: u32>(
    proof_inputs: [ProofInput<MAX_PREFIXED_KEY_NIBBLE_LEN, MAX_STORAGE_VALUE_LEN, MAX_STORAGE_DEPTH_NO_LEAF, MAX_STORAGE_LEAF_LEN>; N],
    storage_root: Bytes32
) {
    for i in 0..N {
        let proof_input = proof_inputs[i];
        verify_merkle_proof(
            proof_input.key,
            proof_input.value,
            storage_root,
            proof_input.proof
        );
    }
}
