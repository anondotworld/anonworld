use crate::{verifiers::transaction::MAX_TX_RLP_LENGTH, transaction::{TxType, TxPartial}};
use crate::misc::fragment::Fragment;
use crate::rlp::decode::decode_list;
use crate::rlp::types::RlpList;

struct FieldLayout {
    field_count: u32,
    nonce_idx: u32,
    gas_limit_idx: u32,
    to_idx: u32,
    signature_idx: u32,
}

global TX_TYPE_TO_FIELD_LAYOUT = [
    FieldLayout {field_count: 9, nonce_idx: 0, gas_limit_idx: 2, to_idx: 3, signature_idx: 6},
    FieldLayout {field_count: 11, nonce_idx: 1, gas_limit_idx: 3, to_idx: 4, signature_idx: 8},
    FieldLayout {field_count: 12, nonce_idx: 1, gas_limit_idx: 4, to_idx: 5, signature_idx: 9},
    FieldLayout {field_count: 14, nonce_idx: 1, gas_limit_idx: 4, to_idx: 5, signature_idx: 11},
];

global MAX_TX_FIELDS_COUNT = 14;

pub(crate) fn assert_tx_rlp_equals<let MAX_DATA_LEN: u32, let MAX_ENCODED_LEN: u32>(
    tx_rlp: Fragment<MAX_ENCODED_LEN, u8>,
    tx_type: TxType,
    tx: TxPartial<MAX_DATA_LEN>
) {
    let rlp_list: RlpList<MAX_TX_FIELDS_COUNT> = decode_list(tx_rlp);

    let FieldLayout {field_count, nonce_idx, gas_limit_idx, to_idx, signature_idx} = TX_TYPE_TO_FIELD_LAYOUT[tx_type];
    assert(rlp_list.len == field_count, "Invalid number of fields in tx RLP");

    rlp_list.get(nonce_idx).assert_eq_u64("Nonce", tx_rlp, tx.nonce);

    rlp_list.get(gas_limit_idx).assert_eq_u64("Gas limit", tx_rlp, tx.gas_limit);

    if (tx.to.is_some()) {
        rlp_list.get(to_idx).assert_eq_address("To", tx_rlp, tx.to.expect(f"to is missing"));
    } else {
        rlp_list.get(to_idx).assert_empty_string("To");
    }

    rlp_list.get(to_idx + 1).assert_eq_u128("Value", tx_rlp, tx.value);

    rlp_list.get(to_idx + 2).assert_eq_bounded_vec("Data", tx_rlp, tx.data);

    rlp_list.get(signature_idx).assert_eq_u8("V", tx_rlp, tx.v);
    rlp_list.get(signature_idx + 1).assert_eq_bytes32("R", tx_rlp, tx.r);
    rlp_list.get(signature_idx + 2).assert_eq_bytes32("S", tx_rlp, tx.s);
}
