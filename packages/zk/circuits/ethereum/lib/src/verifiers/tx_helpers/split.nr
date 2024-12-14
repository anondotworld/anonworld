use crate::misc::fragment::Fragment;

pub(crate) fn split_into_tx_type_and_rlp<let MAX_ENCODED_LEN: u32>(
    is_legacy: bool,
    encoded: Fragment<MAX_ENCODED_LEN, u8>
) -> (u8, Fragment<MAX_ENCODED_LEN, u8>) {
    let mut rlp = encoded;
    if is_legacy {
        assert_eq(rlp.pop_back(), 0, "RLP receipt exceeds MAX_RLP_LENGTH");
        (0, rlp)
    } else {
        let tx_type = rlp.pop_front();
        (tx_type, rlp)
    }
}
