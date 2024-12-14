use dep::ethereum::account::{get_account, AccountWithinBlock};
use dep::ethereum::misc::types::Address;

fn main(chain_id: pub Field, block_no: pub u64, address: pub Address) -> pub AccountWithinBlock {
    get_account(chain_id, block_no, address)
}
