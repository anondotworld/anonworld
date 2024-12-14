mod U128_ {

    use crate::serde::U128_SERIALIZED_LEN;

    #[test]
    fn simple() {
        let value = U128::from_integer(100);
        let serialized: [Field; U128_SERIALIZED_LEN] = value.serialize();

        assert_eq(serialized[0], value.lo);
        assert_eq(serialized[1], value.hi);
        assert_eq(U128::deserialize(serialized), value);
    }
}

mod U256 {
    use crate::uint256::U256;
    use crate::serde::U256_SERIALIZED_LEN;

    global u128_number = 0x10000000000000000000000000000000;
    global u64_value = 0x1000000000000000;

    #[test]
    fn simple() {
        let value = U256::new(
            U128::from_integer(u128_number),
            U128::from_integer(u128_number)
        );
        let serialized: [Field; U256_SERIALIZED_LEN] = value.serialize();

        assert_eq(serialized[0], 0);
        assert_eq(serialized[1], u64_value);
        assert_eq(serialized[2], 0);
        assert_eq(serialized[3], u64_value);
        assert_eq(U256::deserialize(serialized), value);
    }
}

mod u8_array {
    use crate::misc::types::{Bytes32, BYTES32_LENGTH, Address, ADDRESS_LENGTH};

    #[test]
    fn bytes32() {
        let bytes: Bytes32 = [1; BYTES32_LENGTH];
        let serialized: [Field; BYTES32_LENGTH] = bytes.serialize();
        let expected: [Field; BYTES32_LENGTH] = [1; BYTES32_LENGTH];
        assert_eq(serialized, expected);
        assert_eq(serialized.deserialize(), bytes);
    }

    #[test]
    fn address() {
        let address: Address = [1; ADDRESS_LENGTH];
        let serialized: [Field; ADDRESS_LENGTH] = address.serialize();
        let expected: [Field; ADDRESS_LENGTH] = [1; ADDRESS_LENGTH];
        assert_eq(serialized, expected);
        assert_eq(serialized.deserialize(), address);
    }
}

mod account {
    use crate::account_with_storage::Account;
    use crate::serde::ACCOUNT_LEN;
    use crate::misc::arrays::sub_array_equals;
    use crate::fixtures::mainnet::london::vitalik_balance::account::account;

    #[test]
    fn simple() {
        let serialized: [Field; ACCOUNT_LEN] = account.serialize();

        assert_eq(serialized[0], account.nonce as Field);
        assert_eq(serialized[1], account.balance);
        assert(sub_array_equals(account.storage_root.serialize(), serialized, 2));
        assert(sub_array_equals(account.code_hash.serialize(), serialized, 34));
        assert_eq(Account::deserialize(serialized), account);
    }
}

mod account_within_block {
    use crate::serde::{ACCOUNT_BLOCK_LEN, ACCOUNT_LEN};
    use crate::account::AccountWithinBlock;
    use crate::fixtures::mainnet::london::vitalik_balance::{account::account, header::hash};
    use crate::misc::arrays::sub_array_equals;

    #[test]
    fn simple() {
        let account_within_block = AccountWithinBlock { account, block_hash: hash };
        let serialized: [Field; ACCOUNT_BLOCK_LEN] = account_within_block.serialize();

        assert(sub_array_equals(account_within_block.account.serialize(), serialized, 0));
        assert(
            sub_array_equals(
                account_within_block.block_hash.serialize(),
                serialized,
                ACCOUNT_LEN
            )
        );
        assert_eq(AccountWithinBlock::deserialize(serialized), account_within_block);
    }
}

mod storage_within_block {
    use crate::serde::{STORAGE_BLOCK_LEN, ACCOUNT_LEN};
    use crate::account_with_storage::StorageWithinBlock;
    use crate::fixtures::mainnet::paris::usdc_circle::{account::account, header::hash, storage_proof::proofs, storage::values};
    use crate::misc::{types::BYTES32_LENGTH, arrays::sub_array_equals};

    #[test]
    fn simple() {
        let storage_within_block = StorageWithinBlock { block_hash: hash, account, values };
        let serialized: [Field; STORAGE_BLOCK_LEN] = storage_within_block.serialize();

        assert(sub_array_equals(storage_within_block.block_hash.serialize(), serialized, 0));
        assert(
            sub_array_equals(
                storage_within_block.account.serialize(),
                serialized,
                BYTES32_LENGTH
            )
        );
        assert(
            sub_array_equals(
                storage_within_block.values[0].serialize(),
                serialized,
                BYTES32_LENGTH + ACCOUNT_LEN
            )
        );
        assert_eq(StorageWithinBlock::deserialize(serialized), storage_within_block);
    }
}

mod nodes {
    use crate::fixtures::mainnet::cancun::small_block::receipt_proof::proof_input;
    use crate::merkle_patricia_proofs::proof::MAX_NODE_LEN;
    use crate::misc::arrays::sub_array_equals;
    use crate::serde::{deserialize_receipt_nodes, serialize_receipt_nodes};

    #[test]
    fn simple() {
        let nodes = proof_input.proof.nodes;
        let serialized = serialize_receipt_nodes(nodes);

        assert(sub_array_equals(nodes[0].serialize(), serialized, 0));
        assert(
            sub_array_equals(
                nodes[nodes.len() - 1].serialize(),
                serialized,
                MAX_NODE_LEN * (nodes.len() - 1) - 1
            )
        );
        assert_eq(deserialize_receipt_nodes(serialized), nodes);
    }
}

mod proof {
    use crate::fixtures::mainnet::cancun::small_block::receipt_proof::proof_input;
    use crate::receipt::MAX_DEPTH_NO_LEAF as RECEIPT_MAX_DEPTH_NO_LEAF;
    use crate::serde::{Serde, serialize_receipt_nodes, RECEIPT_MAX_LEAF_LEN_M, RECEIPT_NODES_LEN};
    use crate::merkle_patricia_proofs::proof::Proof;
    use crate::misc::arrays::sub_array_equals;

    #[test]
    fn simple() {
        let proof = proof_input.proof;
        let serialized = proof.serialize();

        assert(sub_array_equals(serialize_receipt_nodes(proof.nodes), serialized, 0));
        assert(sub_array_equals(proof.leaf.serialize(), serialized, RECEIPT_NODES_LEN));
        assert_eq(serialized[RECEIPT_NODES_LEN + RECEIPT_MAX_LEAF_LEN_M], proof.depth as Field);

        let deserialized = Serde::deserialize(serialized);
        assert_eq(deserialized, proof);
    }
}

mod proof_input {
    use crate::fixtures::mainnet::cancun::small_block::receipt_proof::proof_input;
    use crate::receipt::{MAX_DEPTH_NO_LEAF as RECEIPT_MAX_DEPTH_NO_LEAF, MAX_LEAF_LEN_M as RECEIPT_MAX_LEAF_LEN_M};
    use crate::serde::{Serde, RECEIPT_MAX_PREFIXED_KEY_NIBBLE_LEN, RECEIPT_MAX_VALUE_LEN_M};
    use crate::misc::arrays::sub_array_equals;
    use crate::merkle_patricia_proofs::proof::ProofInput;

    #[test]
    fn simple() {
        let serialized = proof_input.serialize();

        assert(sub_array_equals(proof_input.key.serialize(), serialized, 0));
        assert(
            sub_array_equals(
                proof_input.value.serialize(),
                serialized,
                RECEIPT_MAX_PREFIXED_KEY_NIBBLE_LEN
            )
        );
        assert(
            sub_array_equals(
                proof_input.proof.serialize(),
                serialized,
                RECEIPT_MAX_PREFIXED_KEY_NIBBLE_LEN + RECEIPT_MAX_VALUE_LEN_M
            )
        );

        let deserialized = Serde::deserialize(serialized);
        assert_eq(deserialized, proof_input);
    }
}
