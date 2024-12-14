use crate::header::{BlockHeaderPartial, BlockHeaderRlp, MAX_HEADER_RLP_LEN};
use crate::chain::ETHEREUM_MAINNET_ID;
use crate::verifiers::header::{get_header_fields_count, verify_header, LONDON_BLOCK_NUM, PARIS_BLOCK_NUM, CANCUN_BLOCK_NUM};
use crate::misc::arrays::alter_array;
use crate::fixtures::mainnet::{
    london::crypto_punks::header::{block_header_partial as london_block_header_partial, block_header_rlp as london_block_header_rlp},
    frontier::zero::header::{
    block_header_partial as frontier_zero_block_header_partial,
    block_header_rlp as frontier_zero_block_header_rlp
},
    frontier::first::header::{
    block_header_partial as frontier_first_block_header_partial,
    block_header_rlp as frontier_first_block_header_rlp
},
    paris::usdc_circle::header::{block_header_partial as paris_block_header_partial, block_header_rlp as paris_block_header_rlp},
    paris::usdc_circle::header::{hash, number, state_root, transactions_root, receipts_root},
    cancun::small_block::header::{
    block_header_partial as cancun_small_block_header_partial,
    block_header_rlp as cancun_small_block_header_rlp, hash as cancun_hash,
    state_root as cancun_state_root, transactions_root as cancun_transactions_root,
    receipts_root as cancun_receipts_root
},
    cancun::with_blob::header::{
    block_header_partial as cancun_with_blob_block_header_partial,
    block_header_rlp as cancun_with_blob_block_header_rlp
}
};

#[test]
fn test_verify_frontier_zero_header_success() {
    verify_header(
        ETHEREUM_MAINNET_ID,
        frontier_zero_block_header_partial,
        frontier_zero_block_header_rlp
    );
}

#[test]
fn test_verify_frontier_first_header_success() {
    verify_header(
        ETHEREUM_MAINNET_ID,
        frontier_first_block_header_partial,
        frontier_first_block_header_rlp
    );
}

#[test]
fn test_verify_london_header_success() {
    verify_header(
        ETHEREUM_MAINNET_ID,
        london_block_header_partial,
        london_block_header_rlp
    );
}

#[test]
fn test_verify_paris_header_success() {
    verify_header(
        ETHEREUM_MAINNET_ID,
        paris_block_header_partial,
        paris_block_header_rlp
    );
}

#[test]
fn test_verify_cancun_small_block_header_success() {
    verify_header(
        ETHEREUM_MAINNET_ID,
        cancun_small_block_header_partial,
        cancun_small_block_header_rlp
    );
}

#[test]
fn test_verify_cancun_with_blob_header_success() {
    verify_header(
        ETHEREUM_MAINNET_ID,
        cancun_with_blob_block_header_partial,
        cancun_with_blob_block_header_rlp
    );
}

#[test(should_fail_with = "Block number: Invalid RLP value")]
fn test_verify_header_invalid_block_number() {
    let wrong_number = number + 1;
    let paris_block_header_partial = BlockHeaderPartial { number: wrong_number, hash, state_root, transactions_root, receipts_root };
    verify_header(
        ETHEREUM_MAINNET_ID,
        paris_block_header_partial,
        paris_block_header_rlp
    );
}

#[test(should_fail_with = "Block number: Invalid RLP length")]
fn test_verify_header_invalid_block_number_length() {
    // This is 0x100000000 which takes up 6 bytes which is not equal to the 5 bytes that original cancun block number 19432086 takes up
    let wrong_number_length = 4294967296;
    let cancun_small_block_header_partial = BlockHeaderPartial {
        number: wrong_number_length,
        hash: cancun_hash,
        state_root: cancun_state_root,
        transactions_root: cancun_transactions_root,
        receipts_root: cancun_receipts_root
    };
    verify_header(
        ETHEREUM_MAINNET_ID,
        cancun_small_block_header_partial,
        cancun_small_block_header_rlp
    );
}

#[test(should_fail_with = "block hash does not match")]
fn test_verify_header_invalid_hash() {
    let hash = alter_array(hash);
    let paris_block_header_partial = BlockHeaderPartial { number, hash, state_root, transactions_root, receipts_root };
    verify_header(
        ETHEREUM_MAINNET_ID,
        paris_block_header_partial,
        paris_block_header_rlp
    );
}

#[test(should_fail_with = "State root: Invalid RLP value")]
fn test_verify_header_invalid_state_root() {
    let state_root = alter_array(state_root);
    let paris_block_header_partial = BlockHeaderPartial { number, hash, state_root, transactions_root, receipts_root };
    verify_header(
        ETHEREUM_MAINNET_ID,
        paris_block_header_partial,
        paris_block_header_rlp
    );
}

#[test(should_fail_with = "Transactions root: Invalid RLP value")]
fn test_verify_header_invalid_transactions_root() {
    let transactions_root = alter_array(transactions_root);
    let paris_block_header_partial = BlockHeaderPartial { number, hash, state_root, transactions_root, receipts_root };
    verify_header(
        ETHEREUM_MAINNET_ID,
        paris_block_header_partial,
        paris_block_header_rlp
    );
}

#[test(should_fail_with = "Receipts root: Invalid RLP value")]
fn test_verify_header_invalid_receipt_root() {
    let receipts_root = alter_array(receipts_root);
    let paris_block_header_partial = BlockHeaderPartial { number, hash, state_root, transactions_root, receipts_root };
    verify_header(
        ETHEREUM_MAINNET_ID,
        paris_block_header_partial,
        paris_block_header_rlp
    );
}

global RLP_SHORT_STRING_TYPE = 0x80;

#[test(should_fail_with="Expected a list")]
fn test_verify_header_invalid_rlp() {
    let mut rlp_empty_string_encoding = [0; MAX_HEADER_RLP_LEN];
    rlp_empty_string_encoding[0] = RLP_SHORT_STRING_TYPE;
    let malformed_block_header_rlp = BoundedVec { storage: rlp_empty_string_encoding, len: 1 };
    let paris_block_header_partial = BlockHeaderPartial { number, hash, state_root, transactions_root, receipts_root };
    verify_header(
        ETHEREUM_MAINNET_ID,
        paris_block_header_partial,
        malformed_block_header_rlp
    );
}

#[test(should_fail_with = "number of header RLP fields does not match")]
fn test_verify_header_invalid_rlp_fields_count() {
    verify_header(
        ETHEREUM_MAINNET_ID,
        paris_block_header_partial,
        frontier_first_block_header_rlp
    );
}

#[test]
fn test_get_header_fields_count() {
    let frontier_block_number = 1_920_000;
    let london_block_number = 13_000_000;
    let paris_block_number = 16_000_000;
    let cancun_block_number = 19_432_540;

    assert_eq(get_header_fields_count(ETHEREUM_MAINNET_ID, frontier_block_number), 15);
    assert_eq(get_header_fields_count(ETHEREUM_MAINNET_ID, LONDON_BLOCK_NUM), 16);
    assert_eq(get_header_fields_count(ETHEREUM_MAINNET_ID, london_block_number), 16);
    assert_eq(get_header_fields_count(ETHEREUM_MAINNET_ID, PARIS_BLOCK_NUM), 17);
    assert_eq(get_header_fields_count(ETHEREUM_MAINNET_ID, paris_block_number), 17);
    assert_eq(get_header_fields_count(ETHEREUM_MAINNET_ID, CANCUN_BLOCK_NUM), 20);
    assert_eq(get_header_fields_count(ETHEREUM_MAINNET_ID, cancun_block_number), 20);
}
