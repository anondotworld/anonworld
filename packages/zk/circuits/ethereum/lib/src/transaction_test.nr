use crate::fixtures::mainnet::cancun::approve::transaction::transaction;
use crate::misc::bounded_vecs::bounded_vec_from_array;
use crate::transaction::{ForeignCallTransaction, TxPartial};
use dep::std::mem::zeroed;

global data_length: u32 = 8;

#[test]
fn into_foreign_call_transaction_test() {
    let transaction: TxPartial<data_length> = TxPartial {
        nonce: 0,
        gas_limit: 0,
        to: transaction.to,
        value: transaction.value,
        data: bounded_vec_from_array([1, 2, 3, 4, 5]),
        v: 0,
        r: std::mem::zeroed(),
        s: std::mem::zeroed(),
    };
    let foreign_call_transaction: ForeignCallTransaction<data_length> = transaction.into();

    assert_eq(foreign_call_transaction.to_is_some, true);
    assert_eq(foreign_call_transaction.to, transaction.to.expect(f"To is missing"));

    assert_eq(foreign_call_transaction.value_hi, transaction.value.hi as u64);
    assert_eq(foreign_call_transaction.value_lo, transaction.value.lo as u64);

    assert_eq(foreign_call_transaction.data, [1, 2, 3, 4, 5, 0, 0, 0]);
    assert_eq(foreign_call_transaction.data_len, 5);
}
