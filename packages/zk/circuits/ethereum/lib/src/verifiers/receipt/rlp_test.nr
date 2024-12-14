use crate::fixtures::mainnet::{
    cancun::small_block::receipt::{receipt, receipt_rlp},
    homestead::fork::receipt::{
        receipt as pre_byzantium_receipt, receipt_rlp as pre_byzantium_receipt_rlp,
    },
};
use crate::misc::{arrays::{alter_array, resize}, fragment::Fragment};
use crate::verifiers::receipt::rlp::assert_receipt_rlp_equals;
use dep::std::wrapping_add;

global receipt_rlp_fragment = Fragment::from_array(receipt_rlp);
global pre_byzantium_receipt_rlp_fragment = Fragment::from_array(pre_byzantium_receipt_rlp);

#[test]
fn test_pre_byzantium() {
    assert_receipt_rlp_equals(
        true,
        Fragment::from_array(pre_byzantium_receipt_rlp),
        pre_byzantium_receipt,
    );
}

#[test]
fn test_post_byzantium() {
    assert_receipt_rlp_equals(false, receipt_rlp_fragment, receipt);
}

#[test(should_fail_with = "Expected a list")]
fn test_assert_receipt_rlp_equals_invalid_rlp_type() {
    let empty_string_rlp = Fragment::from_array([0x80]); // ""
    assert_receipt_rlp_equals(false, empty_string_rlp, receipt);
}

#[test(should_fail_with = "Invalid number of fields in receipt RLP")]
fn test_assert_receipt_rlp_equals_invalid_rlp_field_count() {
    let list_with_single_string = Fragment::from_array([0xc1, 0x80]); // [""]
    assert_receipt_rlp_equals(false, list_with_single_string, receipt);
}

#[test(should_fail_with = "State root is missing")]
fn test_assert_receipt_rlp_equals_missing_state_root() {
    let mut receipt = pre_byzantium_receipt;
    receipt.state_root = Option::none();
    assert_receipt_rlp_equals(true, pre_byzantium_receipt_rlp_fragment, receipt);
}

#[test(should_fail_with = "State root: Invalid RLP value")]
fn test_assert_receipt_rlp_equals_invalid_state_root_value() {
    let mut receipt = pre_byzantium_receipt;
    receipt.state_root = receipt.state_root.map(alter_array);
    assert_receipt_rlp_equals(true, pre_byzantium_receipt_rlp_fragment, receipt);
}

#[test(should_fail_with = "Status is missing")]
fn test_assert_receipt_rlp_equals_missing_status() {
    let mut receipt = receipt;
    receipt.status = Option::none();
    assert_receipt_rlp_equals(false, receipt_rlp_fragment, receipt);
}

#[test(should_fail_with = "Status: Invalid RLP value")]
fn test_assert_receipt_rlp_equals_invalid_status_value() {
    let mut receipt = receipt;
    receipt.status = receipt.status.map(|status| 1 - status);
    assert_receipt_rlp_equals(false, receipt_rlp_fragment, receipt);
}

#[test(should_fail_with = "Cumulative gas used: Invalid RLP value")]
fn test_assert_receipt_rlp_equals_invalid_cumulative_gas_used_value() {
    let mut receipt = receipt;
    receipt.cumulative_gas_used = wrapping_add(receipt.cumulative_gas_used, 1);
    assert_receipt_rlp_equals(false, receipt_rlp_fragment, receipt);
}

#[test(should_fail_with = "Logs bloom: Invalid RLP value")]
fn test_assert_receipt_rlp_equals_invalid_logs_bloom_value() {
    let mut receipt = receipt;
    receipt.logs_bloom = alter_array(receipt.logs_bloom);
    assert_receipt_rlp_equals(false, receipt_rlp_fragment, receipt);
}
