use dep::std::hash::keccak256;

use crate::chain::{ETHEREUM_MAINNET_ID, ETHEREUM_SEPOLIA_ID};
use crate::HASH_LEN;
use crate::header::{BlockHeaderPartial, BlockHeaderRlp};
use crate::misc::{arrays::sub_array_equals, fragment::Fragment};
use crate::rlp::decode::decode_list;
use crate::rlp::types::RlpList;

global MAX_HEADER_FIELDS_COUNT = 20;
global STATE_ROOT_INDEX = 3;
global TRANSACTIONS_ROOT_INDEX = 4;
global RECEIPTS_ROOT_INDEX = 5;
global BLOCK_NUM_INDEX = 8;

global LONDON_BLOCK_NUM: u64 = 12_965_000;
global PARIS_BLOCK_NUM: u64 = 15_537_394;
global CANCUN_BLOCK_NUM: u64 = 19_426_587;

pub(crate) fn get_header_fields_count(chain_id: Field, block_number: u64) -> u32 {
    let mut fields_count = 15;
    if chain_id == ETHEREUM_MAINNET_ID {
        if block_number >= LONDON_BLOCK_NUM {
            fields_count += 1;
        }
        if block_number >= PARIS_BLOCK_NUM {
            fields_count += 1;
        }
        if block_number >= CANCUN_BLOCK_NUM {
            fields_count += 3;
        }
    } else if chain_id == ETHEREUM_SEPOLIA_ID {
        fields_count = 20;
    } else {
        assert(false, "Unsupported chain ID");
    }
    fields_count
}

pub fn verify_header(
    chain_id: Field,
    block_header_partial: BlockHeaderPartial,
    block_header_rlp: BlockHeaderRlp,
) {
    let block_header_rlp = Fragment::from_vec(block_header_rlp);
    let header_rlp_list: RlpList<MAX_HEADER_FIELDS_COUNT> = decode_list(block_header_rlp);
    let expected_header_fields_count =
        get_header_fields_count(chain_id, block_header_partial.number);

    assert(
        expected_header_fields_count == header_rlp_list.len,
        "number of header RLP fields does not match",
    );

    header_rlp_list.get(BLOCK_NUM_INDEX).assert_eq_u64(
        "Block number",
        block_header_rlp,
        block_header_partial.number,
    );
    header_rlp_list.get(STATE_ROOT_INDEX).assert_eq_bytes32(
        "State root",
        block_header_rlp,
        block_header_partial.state_root,
    );
    header_rlp_list.get(TRANSACTIONS_ROOT_INDEX).assert_eq_bytes32(
        "Transactions root",
        block_header_rlp,
        block_header_partial.transactions_root,
    );
    header_rlp_list.get(RECEIPTS_ROOT_INDEX).assert_eq_bytes32(
        "Receipts root",
        block_header_rlp,
        block_header_partial.receipts_root,
    );

    assert(
        sub_array_equals(
            keccak256(block_header_rlp.data, block_header_rlp.length as u32),
            block_header_partial.hash,
            0,
        ),
        "block hash does not match",
    );
}
