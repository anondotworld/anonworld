use crate::verifiers::tx_helpers::idx::assert_tx_idx_equals;
use crate::misc::fragment::Fragment;

#[test]
fn test_assert_tx_idx_equals_zero() {
    let tx_idx = 0x0;
    let key = Fragment::from_array([0x80]);
    assert_tx_idx_equals(key, tx_idx);
}

#[test]
fn test_assert_tx_idx_equals_odd() {
    let tx_idx = 0xf;
    let key = Fragment::from_array([0x0f]);
    assert_tx_idx_equals(key, tx_idx);
}

#[test]
fn test_assert_tx_idx_equals() {
    let tx_idx = 0xabcd;
    let key = Fragment::from_array([0x82, 0xab, 0xcd]);
    assert_tx_idx_equals(key, tx_idx);
}

#[test(should_fail_with="Key is not an rlp-encoded string")]
fn test_assert_tx_idx_equals_fail_incorrect_rlp_encoding() {
    let tx_idx = 0x1;
    let key_encoded_incorrectly = Fragment::from_array([0x01, 0xab, 0xce]);
    assert_tx_idx_equals(key_encoded_incorrectly, tx_idx);
}

#[test(should_fail_with="Key does not match rlp-encoded transaction index")]
fn test_assert_tx_idx_equals_fail_zero() {
    let wrong_tx_idx = 0x0 + 1;
    let key = Fragment::from_array([0x80]);
    assert_tx_idx_equals(key, wrong_tx_idx);
}

#[test(should_fail_with="Key does not match rlp-encoded transaction index")]
fn test_assert_tx_idx_equals_fail() {
    let tx_idx = 0xabcd;
    let wrong_key = Fragment::from_array([0x82, 0xab, 0xcd + 1]);
    assert_tx_idx_equals(wrong_key, tx_idx);
}
