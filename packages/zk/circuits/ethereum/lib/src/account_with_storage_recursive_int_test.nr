use crate::account_with_storage_recursive::{get_account_with_storage_recursive, RecursiveProof};
use crate::account_with_storage::StorageWithinBlock;
use crate::fixtures::mainnet::paris::usdc_circle::{header::{number, hash}, account::{address, account}, storage::{keys, values}};
use crate::chain::ETHEREUM_MAINNET_ID;
use crate::misc::types::{Bytes32, Address};
use dep::std::test::OracleMock;
use dep::std::mem::zeroed;

#[test]
fn success() {
    let result = StorageWithinBlock { block_hash: hash, account, values };
    // This is not a correct proof but it passes because nargo does not verify it. Nargo thinks that it's bb's job, but doesn't call bb.
    let recursive_proof: RecursiveProof = std::mem::zeroed();

    let _ = OracleMock::mock("get_storage_recursive").returns((result.serialize(), recursive_proof));

    let _ = get_account_with_storage_recursive(ETHEREUM_MAINNET_ID, number, address, keys[0]);
}
