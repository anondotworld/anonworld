use crate::account::{MAX_ACCOUNT_DEPTH_NO_LEAF_M, MAX_ACCOUNT_LEAF_LEN, MAX_ACCOUNT_STATE_LEN};
use crate::header::{BlockHeaderPartial, get_header};
use crate::merkle_patricia_proofs::proof::ProofInput;
use crate::misc::{
    bytes::right_pad,
    fragment::Fragment,
    types::{Address, Bytes32, BYTES32_LENGTH, HASH_LEN},
};
use crate::rlp::decode::decode_string;
use crate::serde::Serde;
use crate::verifiers::account::verify_account;
use crate::verifiers::storage::verify_storage_values;

use dep::std::hash::keccak256;

global MAX_KEY_LEN: u32 = 32;
global MAX_PREFIXED_KEY_NIBBLE_LEN: u32 = 66; // (MAX_KEY_LEN + 1) * 2
global MAX_STORAGE_DEPTH_NO_LEAF_M = 7; // Emperically correct values to be determined after we scan ethereum state trie.

global MAX_STORAGE_VALUE_LEN: u32 = 32; // Values taken from storageProofConfig in storage.ts.
global MAX_STORAGE_LEAF_LEN: u32 = 69;

struct Account {
    nonce: u64,
    balance: Field,
    storage_root: Bytes32,
    code_hash: Bytes32,
}

impl Eq for Account {
    fn eq(self, other: Self) -> bool {
        (self.nonce == other.nonce)
            & (self.balance == other.balance)
            & (self.storage_root == other.storage_root)
            & (self.code_hash == other.code_hash)
    }
}

// For now oracle does not support returning array of arrays so at the moment we support only one storage proof.
// When https://github.com/noir-lang/noir/issues/4498 is resolved we can change to `StateAndStorageProof<N>` and `storage_proof: [StorageProof; N]`.
struct StateAndStorageProofInput {
    account: Account,
    state_proof_input: ProofInput<MAX_PREFIXED_KEY_NIBBLE_LEN, MAX_ACCOUNT_STATE_LEN, MAX_ACCOUNT_DEPTH_NO_LEAF_M, MAX_ACCOUNT_LEAF_LEN>,
    storage_proof_input: ProofInput<MAX_PREFIXED_KEY_NIBBLE_LEN, MAX_STORAGE_VALUE_LEN, MAX_STORAGE_DEPTH_NO_LEAF_M, MAX_STORAGE_LEAF_LEN>,
}

struct StorageWithinBlock<let N: u32> {
    block_hash: Bytes32,
    account: Account,
    values: [Bytes32; N],
}

type ProofInputSerialized<let LEN: u32> = [Field; LEN];

impl Eq for StorageWithinBlock<1> {
    fn eq(self, other: Self) -> bool {
        (self.block_hash == other.block_hash)
            & (self.account == other.account)
            & (self.values[0] == other.values[0])
    }
}

fn assert_storage_key_equals(
    storage_key: Bytes32,
    storage_key_hash: [u8; MAX_PREFIXED_KEY_NIBBLE_LEN],
) {
    let storage_key_hash_fragment = Fragment::new(
        MAX_PREFIXED_KEY_NIBBLE_LEN - HASH_LEN,
        HASH_LEN,
        storage_key_hash,
    );
    let other_storage_key_hash_fragment =
        Fragment::from_array(keccak256(storage_key, BYTES32_LENGTH as u32));
    assert(
        storage_key_hash_fragment.eq(other_storage_key_hash_fragment),
        "Storage key does not match the argument",
    );
}

fn get_fragment<let N: u32>(left_padded_value: [u8; N]) -> Fragment<N, u8> {
    let value_len = right_pad(left_padded_value).len();
    let value_offset = N - value_len;
    Fragment::new(value_offset, value_len, left_padded_value)
}

fn get_storage_value(
    rlp_encoded_value: [u8; MAX_STORAGE_VALUE_LEN],
) -> [u8; MAX_STORAGE_VALUE_LEN] {
    let mut storage_value = get_fragment(rlp_encoded_value);
    let rlp_fragment = decode_string(storage_value);
    let rlp_header_len = rlp_fragment.offset;

    // Storage value is maximum 32 bytes long, so its RLP-encoding's header is maximum 1 byte long.
    assert(rlp_header_len <= 1, "Expected RLP header to be maximum 1 byte long");
    if rlp_fragment.offset == 1 {
        let rlp_header_position = storage_value.offset;
        storage_value.data[rlp_header_position] = 0;
    }

    storage_value.data
}

pub fn get_account_with_storage(
    chain_id: Field,
    block_number: u64,
    address: Address,
    storage_key: Bytes32,
) -> StorageWithinBlock<1> {
    let BlockHeaderPartial { number: _, hash, state_root, transactions_root: _, receipts_root: _ } =
        get_header(chain_id, block_number);
    let StateAndStorageProofInput { account, state_proof_input, storage_proof_input } =
        get_proof_unconstrained(chain_id, block_number, address, storage_key);

    verify_account(address, account, state_proof_input, state_root);
    verify_storage_values([storage_proof_input], account.storage_root);

    assert_storage_key_equals(storage_key, storage_proof_input.key);

    StorageWithinBlock {
        block_hash: hash,
        account,
        values: [get_storage_value(storage_proof_input.value)],
    }
}

#[oracle(get_proof)]
unconstrained fn get_proof_oracle<let STATE_PROOF_INPUT_LEN: u32, let STORAGE_PROOF_INPUT: u32>(
    _chain_id: Field,
    _block_no: u64,
    _address: Address,
    _storage_key: Bytes32,
    ) -> (Account, ProofInputSerialized<STATE_PROOF_INPUT_LEN>, ProofInputSerialized<STORAGE_PROOF_INPUT>) {}

unconstrained fn get_proof_unconstrained(
    chain_id: Field,
    block_no: u64,
    address: Address,
    storage_key: Bytes32,
) -> StateAndStorageProofInput {
    let (account, state_proof_input, storage_proof_input) =
        get_proof_oracle(chain_id, block_no, address, storage_key);
    let state_proof_input = Serde::deserialize(state_proof_input);
    let storage_proof_input = Serde::deserialize(storage_proof_input);

    StateAndStorageProofInput { account, state_proof_input, storage_proof_input }
}
