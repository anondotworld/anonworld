use crate::slot::mapping;
use dep::ethereum::{
    account_with_storage::get_account_with_storage,
    misc::{bytes32::address_to_bytes32, types::Address},
};
use dep::ethereum::uint256::U256;
use dep::std::field::bytes32_to_field;

global TOKEN_BALANCE_INDEX = 0;

struct ERC20Token {
    address: Address,
    balances_slot: U256,
    allowances_slot: U256,
    chain_id: Field,
}

impl ERC20Token {
    fn calculate_balance_storage_key(self, wallet_address: Address) -> U256 {
        mapping(self.balances_slot, address_to_bytes32(wallet_address))
    }
}

trait ERC20 {
    fn get_balance(self, wallet_address: Address, block_number: u64) -> U128;
}

impl ERC20 for ERC20Token {
    fn get_balance(self, wallet_address: Address, block_number: u64) -> U128 {
        let storage_key = self.calculate_balance_storage_key(wallet_address);
        let account = get_account_with_storage(
            self.chain_id,
            block_number,
            self.address,
            U256::into(storage_key),
        );
        let balance = account.values[TOKEN_BALANCE_INDEX];
        U128::from_integer(bytes32_to_field(balance))
        // U128::from_integer(100_000)
    }
}
