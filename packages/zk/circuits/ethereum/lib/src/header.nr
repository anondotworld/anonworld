use crate::misc::types::Bytes32;
use crate::verifiers::header::verify_header;

global MAX_HEADER_RLP_LEN: u32 = 708;

struct BlockHeaderPartial {
    number: u64,
    hash: Bytes32,
    state_root: Bytes32,
    transactions_root: Bytes32,
    receipts_root: Bytes32,
}

type BlockHeaderRlp = BoundedVec<u8, MAX_HEADER_RLP_LEN>;

pub fn get_header(chain_id: Field, block_number: u64) -> BlockHeaderPartial {
    let (block_header_partial, block_header_rlp) = get_header_unconstrained(chain_id, block_number);
    verify_header(chain_id, block_header_partial, block_header_rlp);
    assert(block_header_partial.number == block_number, "Block number does not match the argument");
    block_header_partial
}

#[oracle(get_header)]
unconstrained fn get_header_oracle(_chain_id: Field, _block_no: u64) -> (BlockHeaderPartial, BlockHeaderRlp) {}

unconstrained fn get_header_unconstrained(chain_id: Field, block_no: u64) -> (BlockHeaderPartial, BlockHeaderRlp) {
    get_header_oracle(chain_id, block_no)
}
