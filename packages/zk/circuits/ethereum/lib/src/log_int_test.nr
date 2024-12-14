use dep::std::test::OracleMock;

use crate::{
    log::get_log,
    fixtures::mainnet::{
    cancun::{
    small_block::{
    header::{number, block_header_partial, block_header_rlp, hash},
    receipt::{tx_type, foreign_call_receipt}, transaction::tx_idx,
    receipt_proof::proof_input_serialized, log::{log_idx, log}
},
    approve::header::{block_header_partial as another_block_header_partial, block_header_rlp as another_block_header_rlp}
}
},
    chain::ETHEREUM_MAINNET_ID
};

#[test]
 fn get_log_success() {
    let _ = OracleMock::mock("get_header").returns((block_header_partial, block_header_rlp));
    let _ = OracleMock::mock("get_receipt").returns((tx_type, foreign_call_receipt, proof_input_serialized));

    let log_within_block = get_log::<32, 4>(ETHEREUM_MAINNET_ID, number, tx_idx, log_idx);

    assert_eq(log_within_block.log, log);
    assert_eq(log_within_block.block_hash, hash);
}

#[test(should_fail_with="Block number does not match the argument")]
 fn get_log_invalid_block_number() {
    let _ = OracleMock::mock("get_header").returns((another_block_header_partial, another_block_header_rlp));
    let _ = OracleMock::mock("get_receipt").returns((tx_type, foreign_call_receipt, proof_input_serialized));

    let _ = get_log::<32, 4>(ETHEREUM_MAINNET_ID, number, tx_idx, log_idx);
}
