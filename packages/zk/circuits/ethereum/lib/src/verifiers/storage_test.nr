use crate::fixtures::mainnet::paris::usdc_circle::{storage_proof::proofs, account::storage_root};
use crate::verifiers::storage::verify_storage_values;

#[test]
fn test_verify_storage_values() {
    let _ = verify_storage_values(proofs, storage_root);
}

#[test(should_fail)]
fn test_verify_storage_values_invalid_storage_root() {
    let mut root = storage_root;
    root[0] += 1;

    let _ = verify_storage_values(proofs, root);
}
