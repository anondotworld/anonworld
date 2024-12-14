use dep::ethereum::header::{get_header, BlockHeaderPartial};

fn main(chain_id: pub Field, block_no: pub u64) -> pub BlockHeaderPartial {
    get_header(chain_id, block_no)
}
