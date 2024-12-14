use dep::ethereum::misc::types::Address;
use dep::token::token_list::mainnet::USDC;

global MIN_BALANCE = U128::from_integer(100_000); // $100k

fn main() {
    let wallet_balance = USDC.get_balance(
        [
            0x33, 0x36, 0x01, 0xa8, 0x03, 0xca, 0xc3, 0x2b, 0x7d, 0x17, 0xa3, 0x8d, 0x32, 0xc9,
            0x72, 0x8a, 0x93, 0xb4, 0x22, 0xf4,
        ],
        21394392,
    );
    let is_balance_greater_or_equal = MIN_BALANCE <= wallet_balance;

    assert(is_balance_greater_or_equal, "Insufficient USDC balance");
}
