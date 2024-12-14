use crate::transaction::{get_transaction, TransactionWithinBlock};
use crate::fixtures::mainnet::{
    cancun::small_block::{
    header::{number, block_header_partial, block_header_rlp},
    transaction::{tx_idx, tx_type, transaction, foreign_call_transaction},
    transaction_proof::proof_input_serialized
},
    homestead::fork::{
    header::{
    number as another_number, block_header_partial as another_block_header_partial,
    block_header_rlp as another_block_header_rlp
},
    transaction::{
    tx_idx as another_tx_idx, tx_type as another_tx_type,
    foreign_call_transaction as another_foreign_call_transaction
},
    transaction_proof::proof_input_serialized as another_proof_input_serialized
}
};
use dep::std::test::OracleMock;
use crate::chain::ETHEREUM_MAINNET_ID;

global MAX_DATA_LEN: u32 = 1000;

#[test]
fn get_transaction_success() {
    let _ = OracleMock::mock("get_header").returns((block_header_partial, block_header_rlp));
    let _ = OracleMock::mock("get_transaction").returns((tx_type, foreign_call_transaction, proof_input_serialized));

    let transaction_within_block: TransactionWithinBlock<MAX_DATA_LEN> = get_transaction(ETHEREUM_MAINNET_ID, number, tx_idx);

    assert_eq(transaction_within_block.block_hash, block_header_partial.hash);
    assert_eq(transaction_within_block.transaction, foreign_call_transaction.into());
}

#[test(should_fail_with = "Block number does not match the argument")]
fn get_transaction_wrong_block_number() {
    let _ = OracleMock::mock("get_header").returns((block_header_partial, block_header_rlp));
    let _ = OracleMock::mock("get_transaction").returns((tx_type, foreign_call_transaction, proof_input_serialized));

    let wrong_number = number + 1;
    let _: TransactionWithinBlock<MAX_DATA_LEN> = get_transaction(ETHEREUM_MAINNET_ID, wrong_number, tx_idx);
}

#[test(should_fail_with = "Key does not match rlp-encoded transaction index")]
fn get_transaction_wrong_tx_idx() {
    let _ = OracleMock::mock("get_header").returns((block_header_partial, block_header_rlp));
    let _ = OracleMock::mock("get_transaction").returns((tx_type, foreign_call_transaction, proof_input_serialized));

    let wrong_tx_idx = tx_idx + 1;
    let _: TransactionWithinBlock<MAX_DATA_LEN> = get_transaction(ETHEREUM_MAINNET_ID, number, wrong_tx_idx);
}

#[test(should_fail_with = "Invalid node hash")]
fn get_transaction_wrong_transaction() {
    let _ = OracleMock::mock("get_header").returns((block_header_partial, block_header_rlp));
    let _ = OracleMock::mock("get_transaction").returns((another_tx_type, another_foreign_call_transaction, another_proof_input_serialized));

    let _: TransactionWithinBlock<MAX_DATA_LEN> = get_transaction(ETHEREUM_MAINNET_ID, number, another_tx_idx as Field);
}

#[test(should_fail_with = "Invalid node hash")]
fn get_transaction_wrong_header() {
    let _ = OracleMock::mock("get_header").returns((another_block_header_partial, another_block_header_rlp));
    let _ = OracleMock::mock("get_transaction").returns((tx_type, foreign_call_transaction, proof_input_serialized));

    let _: TransactionWithinBlock<MAX_DATA_LEN> = get_transaction(ETHEREUM_MAINNET_ID, another_number, tx_idx);
}
