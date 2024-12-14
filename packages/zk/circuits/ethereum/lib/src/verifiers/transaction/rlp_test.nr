use crate::fixtures::mainnet::{
    homestead::fork::transaction::{transaction as legacy_tx, tx_type as legacy_tx_type, tx_rlp as legacy_tx_rlp},
    cancun::transfer::transaction::{transaction as eip1559_tx, tx_type as eip1559_tx_type, tx_rlp as eip1559_tx_rlp}
};
use crate::verifiers::transaction::rlp::assert_tx_rlp_equals;
use crate::misc::{arrays::{alter_array, resize}, fragment::Fragment};
use dep::std::wrapping_add;

global eip1559_tx_rlp_fragment = Fragment::from_array(eip1559_tx_rlp);

#[test]
fn legacy() {
    assert_tx_rlp_equals(Fragment::from_array(legacy_tx_rlp), legacy_tx_type, legacy_tx);
}

#[test]
fn eip1559() {
    assert_tx_rlp_equals(eip1559_tx_rlp_fragment, eip1559_tx_type, eip1559_tx);
}

#[test(should_fail_with="Expected a list")]
fn invalid_rlp_type() {
    let empty_string_rlp = Fragment::from_array([0x80]); // ""
    assert_tx_rlp_equals(empty_string_rlp, eip1559_tx_type, eip1559_tx);
}

#[test(should_fail_with="Invalid number of fields in tx RLP")]
fn invalid_rlp_field_count() {
    let list_with_single_string = Fragment::from_array([0xc1, 0x80]); // [""]
    assert_tx_rlp_equals(list_with_single_string, eip1559_tx_type, eip1559_tx);
}

#[test(should_fail_with="Nonce: Invalid RLP length")]
fn invalid_nonce_length() {
    let mut tx = eip1559_tx;
    tx.nonce += 1;
    assert_tx_rlp_equals(eip1559_tx_rlp_fragment, eip1559_tx_type, tx);
}

#[test(should_fail_with="Gas limit: Invalid RLP value")]
fn invalid_gas_limit_value() {
    let mut tx = eip1559_tx;
    tx.gas_limit += 1;
    assert_tx_rlp_equals(eip1559_tx_rlp_fragment, eip1559_tx_type, tx);
}

#[test(should_fail_with="To: Expected empty string")]
fn missing_to_value() {
    let mut tx = eip1559_tx;
    tx.to = Option::none();
    assert_tx_rlp_equals(eip1559_tx_rlp_fragment, eip1559_tx_type, tx);
}

#[test(should_fail_with="To: Invalid RLP value")]
fn invalid_to_value() {
    let mut tx = eip1559_tx;
    tx.to = tx.to.map(alter_array);
    assert_tx_rlp_equals(eip1559_tx_rlp_fragment, eip1559_tx_type, tx);
}

#[test(should_fail_with="Value: Invalid RLP value")]
fn invalid_value_value() {
    let mut tx = eip1559_tx;
    tx.value += U128::from_integer(1);
    assert_tx_rlp_equals(eip1559_tx_rlp_fragment, eip1559_tx_type, tx);
}

#[test(should_fail_with="Data: Invalid RLP length")]
fn invalid_data_length() {
    let mut tx = eip1559_tx;
    tx.data.len += 1;
    assert_tx_rlp_equals(eip1559_tx_rlp_fragment, eip1559_tx_type, tx);
}

#[test(should_fail_with="V: Invalid RLP length")]
fn invalid_v_length() {
    let mut tx = eip1559_tx;
    tx.v += 1;
    assert_tx_rlp_equals(eip1559_tx_rlp_fragment, eip1559_tx_type, tx);
}

#[test(should_fail_with="R: Invalid RLP value")]
fn invalid_r_value() {
    let mut tx = eip1559_tx;
    tx.r = alter_array(tx.r);
    assert_tx_rlp_equals(eip1559_tx_rlp_fragment, eip1559_tx_type, tx);
}

#[test(should_fail_with="S: Invalid RLP value")]
fn invalid_s_value() {
    let mut tx = eip1559_tx;
    tx.s = alter_array(tx.s);
    assert_tx_rlp_equals(eip1559_tx_rlp_fragment, eip1559_tx_type, tx);
}
