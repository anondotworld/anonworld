use dep::ethereum::receipt::{get_receipt, TxReceiptWithinBlock};

fn main(chain_id: pub Field, block_number: pub u64, tx_idx: pub Field) -> pub TxReceiptWithinBlock {
    get_receipt(chain_id, block_number, tx_idx)
}
