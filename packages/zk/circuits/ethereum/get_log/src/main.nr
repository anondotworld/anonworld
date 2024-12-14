use dep::ethereum::log::{get_log, LogWithinBlock};

global MAX_LOG_DATA_LEN: u32 = 32;
global MAX_LOGS_COUNT = 1;

fn main(
    chain_id: pub Field,
    block_number: pub u64,
    tx_idx: pub Field,
    log_idx: pub u32
) -> pub LogWithinBlock<MAX_LOG_DATA_LEN> {
    get_log::<MAX_LOG_DATA_LEN, MAX_LOGS_COUNT>(chain_id, block_number, tx_idx, log_idx)
}
