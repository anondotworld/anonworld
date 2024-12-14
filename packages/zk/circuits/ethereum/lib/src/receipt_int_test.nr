use crate::receipt::{get_receipt, TxReceiptWithinBlock};
use crate::fixtures::mainnet::{
    cancun::small_block::{
    header::{number, block_header_partial, block_header_rlp},
    receipt::{tx_type, receipt, foreign_call_receipt}, transaction::tx_idx,
    receipt_proof::proof_input_serialized
},
    cancun::approve::{
    header::{
    number as another_number, block_header_partial as another_block_header_partial,
    block_header_rlp as another_block_header_rlp
},
    receipt::{
    tx_type as another_tx_type, receipt as another_receipt,
    foreign_call_receipt as another_foreign_call_receipt
},
    transaction::tx_idx as another_tx_idx,
    receipt_proof::proof_input_serialized as another_proof_input_serialized
}
};
use dep::std::test::OracleMock;
use crate::chain::ETHEREUM_MAINNET_ID;

#[test]
fn get_receipt_success() {
    let _ = OracleMock::mock("get_header").returns((block_header_partial, block_header_rlp));
    let _ = OracleMock::mock("get_receipt").returns((tx_type, foreign_call_receipt, proof_input_serialized));

    let receipt_within_block: TxReceiptWithinBlock = get_receipt(ETHEREUM_MAINNET_ID, number, tx_idx);

    assert_eq(receipt_within_block.block_hash, block_header_partial.hash);
    assert_eq(receipt_within_block.receipt, receipt);
}

#[test(should_fail_with = "Block number does not match the argument")]
fn get_receipt_wrong_block_number() {
    let _ = OracleMock::mock("get_header").returns((block_header_partial, block_header_rlp));
    let _ = OracleMock::mock("get_receipt").returns((tx_type, foreign_call_receipt, proof_input_serialized));

    let wrong_number = number + 1;
    let _: TxReceiptWithinBlock = get_receipt(ETHEREUM_MAINNET_ID, wrong_number, tx_idx);
}

#[test(should_fail_with = "Key does not match rlp-encoded transaction index")]
fn get_receipt_wrong_tx_idx() {
    let _ = OracleMock::mock("get_header").returns((block_header_partial, block_header_rlp));
    let _ = OracleMock::mock("get_receipt").returns((tx_type, foreign_call_receipt, proof_input_serialized));

    let wrong_tx_idx = tx_idx + 1;
    let _: TxReceiptWithinBlock = get_receipt(ETHEREUM_MAINNET_ID, number, wrong_tx_idx);
}

#[test(should_fail_with = "Invalid node hash")]
fn get_receipt_wrong_recipt() {
    let _ = OracleMock::mock("get_header").returns((block_header_partial, block_header_rlp));
    let _ = OracleMock::mock("get_receipt").returns((another_tx_type, another_foreign_call_receipt, another_proof_input_serialized));

    let _: TxReceiptWithinBlock = get_receipt(ETHEREUM_MAINNET_ID, number, another_tx_idx);
}

#[test(should_fail_with = "Invalid node hash")]
fn get_receipt_wrong_header() {
    let _ = OracleMock::mock("get_header").returns((another_block_header_partial, another_block_header_rlp));
    let _ = OracleMock::mock("get_receipt").returns((tx_type, foreign_call_receipt, proof_input_serialized));

    let _: TxReceiptWithinBlock = get_receipt(ETHEREUM_MAINNET_ID, another_number, tx_idx);
}
