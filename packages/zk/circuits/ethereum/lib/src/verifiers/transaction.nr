mod rlp;
mod rlp_test;

use crate::transaction::{TxPartial, TxType, MAX_PREFIXED_KEY_NIBBLE_LEN, MAX_DEPTH_NO_LEAF};
use crate::verifiers::{
    transaction::rlp::assert_tx_rlp_equals,
    tx_helpers::{idx::assert_tx_idx_equals, split::split_into_tx_type_and_rlp}
};
use crate::misc::{types::HASH_LEN, bytes::right_pad, fragment::Fragment};
use crate::merkle_patricia_proofs::proof::{ProofInput, verify_merkle_proof};

global MAX_ENCODED_TX_LENGTH: u32 = 525;
global MAX_TX_RLP_LENGTH: u32 = MAX_ENCODED_TX_LENGTH - 1;

pub(crate) fn assert_tx_equals<let MAX_DATA_LEN: u32, let MAX_ENCODED_LEN: u32>(
    tx_type: TxType,
    encoded_tx: Fragment<MAX_ENCODED_LEN, u8>,
    tx: TxPartial<MAX_DATA_LEN>
) {
    let is_legacy = tx_type == 0;
    let (actual_tx_type, tx_rlp) = split_into_tx_type_and_rlp(is_legacy, encoded_tx);

    assert(actual_tx_type == tx_type, "Invalid tx type");
    assert_tx_rlp_equals(tx_rlp, tx_type, tx);
}

pub fn verify_tx<let MAX_DATA_LEN: u32, let MAX_ENCODED_LEN: u32, let MAX_LEAF_LEN: u32>(
    tx_idx: Field,
    tx_type: TxType,
    tx: TxPartial<MAX_DATA_LEN>,
    tx_proof_input: ProofInput<MAX_PREFIXED_KEY_NIBBLE_LEN, MAX_ENCODED_LEN, MAX_DEPTH_NO_LEAF, MAX_LEAF_LEN>,
    tx_root: [u8; HASH_LEN]
) {
    let key = Fragment::from_vec(right_pad(tx_proof_input.key));
    assert_tx_idx_equals(key, tx_idx);

    let value = right_pad(tx_proof_input.value).storage;
    assert_tx_equals(tx_type, Fragment::from_array(value), tx);
    verify_merkle_proof(
        tx_proof_input.key,
        tx_proof_input.value,
        tx_root,
        tx_proof_input.proof
    )
}
