use dep::std::test::OracleMock;
use crate::chain::ETHEREUM_MAINNET_ID;
use crate::header::get_header;
use crate::fixtures::mainnet::{
    paris::usdc_circle::header::{block_header_partial as paris_block_header_partial, block_header_rlp as paris_block_header_rlp},
    paris::usdc_circle::header::{hash, number, state_root, transactions_root, receipts_root}
};

#[test]
fn test_get_header_success() {
    let _ = OracleMock::mock("get_header").returns((paris_block_header_partial, paris_block_header_rlp));
    let header = get_header(ETHEREUM_MAINNET_ID, number);
    assert_eq(paris_block_header_partial.number, header.number);
    assert_eq(paris_block_header_partial.hash, header.hash);
    assert_eq(paris_block_header_partial.state_root, header.state_root);
    assert_eq(paris_block_header_partial.transactions_root, header.transactions_root);
    assert_eq(paris_block_header_partial.receipts_root, header.receipts_root);
}

#[test(should_fail_with = "Block number does not match the argument")]
fn test_get_header_invalid_block_number() {
    let wrong_block_number = number + 1;
    let _ = OracleMock::mock("get_header").returns((paris_block_header_partial, paris_block_header_rlp));
    let _ = get_header(ETHEREUM_MAINNET_ID, wrong_block_number);
}
