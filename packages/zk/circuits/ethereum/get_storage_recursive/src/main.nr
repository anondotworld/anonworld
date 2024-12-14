use dep::ethereum::{account_with_storage::{get_account_with_storage, StorageWithinBlock}, misc::types::{Address, Bytes32}};

#[recursive]
fn main(
    chain_id: pub Field,
    block_number: pub u64,
    address: pub Address,
    storage_key: pub Bytes32
) -> pub StorageWithinBlock<1> {
    get_account_with_storage(chain_id, block_number, address, storage_key)
}
