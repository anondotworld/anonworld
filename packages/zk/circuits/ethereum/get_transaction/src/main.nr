use dep::ethereum::transaction::{get_transaction, TransactionWithinBlock};

global MAX_DATA_LEN_M = 1000;

fn main(
    chain_id: pub Field,
    block_number: pub u64,
    tx_idx: pub Field
) -> pub TransactionWithinBlock<MAX_DATA_LEN_M> {
    let transaction_within_block: TransactionWithinBlock<MAX_DATA_LEN_M> = get_transaction(chain_id, block_number, tx_idx);
    transaction_within_block
}
