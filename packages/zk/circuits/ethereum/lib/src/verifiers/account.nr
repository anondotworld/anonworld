use crate::account::{Account, MAX_PREFIXED_KEY_NIBBLE_LEN, MAX_ACCOUNT_STATE_LEN, MAX_ACCOUNT_LEAF_LEN};
use crate::misc::{types::{Address, ADDRESS_LENGTH}, bytes::right_pad, fragment::Fragment};
use crate::rlp::decode::decode_list_of_small_strings;
use crate::rlp::types::RlpList;
use crate::merkle_patricia_proofs::proof::{ProofInput, verify_merkle_proof};
use crate::HASH_LEN;

use dep::std::hash::keccak256;

global ACCOUNT_FIELDS_COUNT = 4;
global NONCE_INDEX  = 0;
global BALANCE_INDEX = 1;
global STORAGE_ROOT_INDEX = 2;
global CODE_HASH_INDEX = 3;

pub(crate) fn assert_account_equals(account_rlp_left_padded: [u8; MAX_ACCOUNT_STATE_LEN], account: Account) {
    let account_rlp_right_padded = right_pad(account_rlp_left_padded).storage;
    let account_rlp_list: RlpList<ACCOUNT_FIELDS_COUNT> = decode_list_of_small_strings(Fragment::from_array(account_rlp_right_padded));
    assert(account_rlp_list.len == ACCOUNT_FIELDS_COUNT, "Invalid number of fields in account RLP");

    let account_rlp = Fragment::from_array(account_rlp_right_padded);
    account_rlp_list.get(NONCE_INDEX).assert_eq_u64("Nonce", account_rlp, account.nonce);
    account_rlp_list.get(BALANCE_INDEX).assert_eq_u128("Balance", account_rlp, U128::from_integer(account.balance));

    account_rlp_list.get(STORAGE_ROOT_INDEX).assert_eq_bytes32("Storage root", account_rlp, account.storage_root);
    account_rlp_list.get(CODE_HASH_INDEX).assert_eq_bytes32("Code hash", account_rlp, account.code_hash);
}

fn assert_address_equals(address_hash: [u8; MAX_PREFIXED_KEY_NIBBLE_LEN], address: Address) {
    let address_hash_fragment = Fragment::new(MAX_PREFIXED_KEY_NIBBLE_LEN - HASH_LEN, HASH_LEN, address_hash);
    let other_address_hash_fragment = Fragment::from_array(keccak256(address, ADDRESS_LENGTH as u32));
    assert(address_hash_fragment.eq(other_address_hash_fragment), "Address mismatch");
}

pub fn verify_account<let MAX_DEPTH_NO_LEAF: u32>(
    address: Address,
    account: Account,
    state_proof_input: ProofInput<MAX_PREFIXED_KEY_NIBBLE_LEN, MAX_ACCOUNT_STATE_LEN, MAX_DEPTH_NO_LEAF, MAX_ACCOUNT_LEAF_LEN>,
    state_root: [u8; HASH_LEN]
) {
    assert_address_equals(state_proof_input.key, address);
    assert_account_equals(state_proof_input.value, account);
    verify_merkle_proof(
        state_proof_input.key,
        state_proof_input.value,
        state_root,
        state_proof_input.proof
    );
}
