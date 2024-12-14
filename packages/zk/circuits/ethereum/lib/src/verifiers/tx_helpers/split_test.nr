mod receipt {
    use crate::misc::{arrays::{sub_array_equals, memcpy}, fragment::Fragment};
    use crate::verifiers::tx_helpers::split::split_into_tx_type_and_rlp;

    use crate::fixtures::mainnet::{
        cancun::small_block::{receipt::{encoded_receipt, tx_type}},
        homestead::fork::{receipt::{encoded_receipt as pre_byzantium_encoded_receipt, tx_type as legacy_tx_type}}
    };
    use crate::receipt::{TxType, MAX_RECEIPT_ENCODED_LEN_M};

    #[test]
    fn eip1559() {
        let (tx_type, receipt_rlp) = split_into_tx_type_and_rlp(false, encoded_receipt);
        assert_eq(tx_type, encoded_receipt.at(0), "Incorrect tx type returned");
        assert_eq(receipt_rlp.length, encoded_receipt.length - 1, "Incorrect receipt RLP length returned");
        assert_eq(
            encoded_receipt.subfragment(1, encoded_receipt.length - 1), receipt_rlp, "Incorrect receipt RLP returned"
        );
    }

    #[test]
    fn legacy() {
        let pre_byzantium_encoded_receipt = pre_byzantium_encoded_receipt;
        let (tx_type, receipt_rlp) = split_into_tx_type_and_rlp(true, pre_byzantium_encoded_receipt);
        assert_eq(tx_type, legacy_tx_type, "Incorrect tx type returned");
        assert_eq(receipt_rlp.length, encoded_receipt.length - 1, "Incorrect receipt RLP length returned");
        assert_eq(
            pre_byzantium_encoded_receipt.subfragment(0, pre_byzantium_encoded_receipt.length - 1), receipt_rlp, "Incorrect receipt RLP returned"
        );
    }

    #[test(should_fail_with="RLP receipt exceeds MAX_RLP_LENGTH")]
    fn legacy_wrong_rlp() {
        let mut wrong_legacy_rlp: Fragment<MAX_RECEIPT_ENCODED_LEN_M, u8> = pre_byzantium_encoded_receipt.focus();
        let not_zero_byte = 0x01;
        wrong_legacy_rlp.set(wrong_legacy_rlp.length - 1, not_zero_byte);

        let (_, _) = split_into_tx_type_and_rlp(true, wrong_legacy_rlp);
    }
}

mod transaction {
    use crate::misc::{arrays::{sub_array_equals, memcpy}, fragment::Fragment};
    use crate::verifiers::tx_helpers::split::split_into_tx_type_and_rlp;

    use crate::fixtures::mainnet::{
        cancun::small_block::{transaction::{encoded_tx, tx_type}},
        homestead::fork::{transaction::{encoded_tx as pre_byzantium_encoded_tx, tx_type as legacy_tx_type}}
    };
    use crate::verifiers::transaction::{MAX_ENCODED_TX_LENGTH, MAX_TX_RLP_LENGTH};
    use crate::transaction::{TxType, MAX_TX_ENCODED_LEN_M};

    #[test]
    fn eip1559() {
        let encoded_tx = Fragment::from_array(encoded_tx);
        let (tx_type, tx_rlp) = split_into_tx_type_and_rlp(false, encoded_tx);
        assert_eq(tx_type, encoded_tx.at(0), "Incorrect tx type returned");
        assert_eq(tx_rlp.length, encoded_tx.length - 1, "Incorrect tx RLP length returned");
        assert_eq(encoded_tx.subfragment(1, encoded_tx.length - 1), tx_rlp, "Incorrect tx RLP returned");
    }

    #[test]
    fn legacy() {
        let pre_byzantium_encoded_tx = Fragment::from_array(pre_byzantium_encoded_tx);
        let (tx_type, tx_rlp) = split_into_tx_type_and_rlp(true, pre_byzantium_encoded_tx);
        assert_eq(tx_type, legacy_tx_type, "Incorrect tx type returned");
        assert_eq(tx_rlp.length, encoded_tx.len() - 1, "Incorrect receipt RLP length returned");
        assert_eq(
            pre_byzantium_encoded_tx.subfragment(0, pre_byzantium_encoded_tx.length - 1), tx_rlp, "Incorrect receipt RLP returned"
        );
    }

    #[test(should_fail_with="RLP receipt exceeds MAX_RLP_LENGTH")]
    fn legacy_wrong_rlp() {
        let mut wrong_legacy_rlp: Fragment<MAX_TX_ENCODED_LEN_M, u8> = Fragment::from_array_resize(pre_byzantium_encoded_tx);
        let not_zero_byte = 0x01;
        wrong_legacy_rlp.set(wrong_legacy_rlp.length - 1, not_zero_byte);

        let (_, _) = split_into_tx_type_and_rlp(true, wrong_legacy_rlp);
    }
}
