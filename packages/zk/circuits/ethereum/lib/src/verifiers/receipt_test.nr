use crate::fixtures::mainnet::{
    cancun::{
    small_block::{
    receipt::{encoded_receipt, receipt, tx_type}, header::{number as block_number, receipts_root},
    receipt_proof::proof_input, transaction::tx_idx
},
    access_list::header::receipts_root as access_list_receipts_root
},
    homestead::fork::{
    receipt::{
    encoded_receipt as pre_byzantium_encoded_receipt, tx_type as legacy_tx_type,
    receipt as pre_byzantium_receipt
},
    header::{number as pre_byzantium_block_number, receipts_root as pre_byzantium_receipt_root},
    receipt_proof::proof_input as pre_byzantium_receipt_proof_input
}
};
use crate::verifiers::receipt::{BYZANTIUM_BLOCK_NUM, assert_receipt_equals, assert_receipt_rlp_equals, verify_receipt};
use crate::misc::fragment::Fragment;

#[test(should_fail_with="Invalid tx type")]
fn test_assert_receipt_equals_wrong_tx_type() {
    let wrong_tx_type = tx_type + 1;
    assert_receipt_equals(BYZANTIUM_BLOCK_NUM, wrong_tx_type, encoded_receipt, receipt);
}

#[test]
fn test_verify_receipt_success() {
    verify_receipt(
        block_number,
        tx_idx,
        tx_type,
        receipt,
        proof_input,
        receipts_root
    );
}

#[test(should_fail_with="Key does not match rlp-encoded transaction index")]
fn test_verify_receipt_invalid_tx_idx() {
    verify_receipt(
        block_number,
        tx_idx + 1,
        tx_type,
        receipt,
        proof_input,
        receipts_root
    );
}

#[test(should_fail_with="Invalid tx type")]
fn test_verify_receipt_invalid_tx_type() {
    verify_receipt(
        block_number,
        tx_idx,
        tx_type + 1,
        receipt,
        proof_input,
        receipts_root
    );
}

#[test(should_fail_with="Status is missing")]
fn test_verify_receipt_invalid_receipt() {
    verify_receipt(
        block_number,
        tx_idx,
        tx_type,
        pre_byzantium_receipt,
        proof_input,
        receipts_root
    );
}

#[test(should_fail_with="Key does not match rlp-encoded transaction index")]
fn test_verify_receipt_invalid_proof() {
    verify_receipt(
        block_number,
        tx_idx,
        tx_type,
        receipt,
        pre_byzantium_receipt_proof_input,
        receipts_root
    );
}

#[test(should_fail_with="Invalid node hash")]
fn test_verify_receipt_invalid_receipts_root() {
    verify_receipt(
        block_number,
        tx_idx,
        tx_type,
        receipt,
        proof_input,
        pre_byzantium_receipt_root
    );
}
