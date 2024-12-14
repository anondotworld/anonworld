use crate::{verifiers::receipt::is_pre_byzantium, receipt::{BLOOM_FILTER_LEN, TxReceiptPartial}};
use crate::misc::fragment::Fragment;
use crate::rlp::decode::decode_list;
use crate::rlp::types::RlpList;

global RECEIPT_FIELDS_COUNT = 4;
global STATE_ROOT_INDEX = 0;
global STATUS_INDEX = 0;
global CUMULATIVE_GAS_USED_INDEX = 1;
global LOGS_BLOOM_INDEX = 2;

pub(crate) fn assert_receipt_rlp_equals<let MAX_ENCODED_LEN: u32>(
    is_pre_byzantium: bool,
    receipt_rlp: Fragment<MAX_ENCODED_LEN, u8>,
    receipt: TxReceiptPartial
) {
    let receipt_rlp_list: RlpList<RECEIPT_FIELDS_COUNT> = decode_list(receipt_rlp);
    assert(receipt_rlp_list.len == RECEIPT_FIELDS_COUNT, "Invalid number of fields in receipt RLP");

    if (is_pre_byzantium) {
        receipt_rlp_list.get(STATE_ROOT_INDEX).assert_eq_bytes32(
            "State root",
            receipt_rlp,
            receipt.state_root.expect(f"State root is missing")
        );
    } else {
        receipt_rlp_list.get(STATUS_INDEX).assert_eq_u1(
            "Status",
            receipt_rlp,
            receipt.status.expect(f"Status is missing")
        );
    }

    receipt_rlp_list.get(CUMULATIVE_GAS_USED_INDEX).assert_eq_u32(
        "Cumulative gas used",
        receipt_rlp,
        receipt.cumulative_gas_used
    );

    receipt_rlp_list.get(LOGS_BLOOM_INDEX).assert_eq_bytes(
        "Logs bloom",
        receipt_rlp,
        Fragment::new_with_length(BLOOM_FILTER_LEN, receipt.logs_bloom)
    );
}
