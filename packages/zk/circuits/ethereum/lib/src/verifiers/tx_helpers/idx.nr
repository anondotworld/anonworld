use dep::u2b::u32_to_u8;
use crate::misc::arrays::{memcpy, sub_array_equals_up_to_length};
use crate::misc::bytes::{nibbles_to_bytes, left_to_right_padding, right_pad};
use crate::misc::fragment::Fragment;
use crate::rlp::{types::RlpFragment, decode::decode_string};

global KEY_NIBBLE_LEN: u32 = 6;
global MAX_TX_IDX_BYTES_LEN: u32 = 2;

pub fn assert_tx_idx_equals<let MAX_KEY_LEN: u32>(key_as_rlp: Fragment<MAX_KEY_LEN, u8>, tx_idx: Field) {
    let RlpFragment { offset, length, data_type: _ } = decode_string(key_as_rlp);
    assert(offset + length == key_as_rlp.length, "Key is not an rlp-encoded string");

    if (length == 0) {
        assert(tx_idx == 0, "Key does not match rlp-encoded transaction index");
    } else {
        let tx_idx_bytes = Fragment::from_vec(right_pad(u32_to_u8(tx_idx as u32)));
        assert(
            key_as_rlp.subfragment(offset, length).eq(tx_idx_bytes), "Key does not match rlp-encoded transaction index"
        );
    }
}
