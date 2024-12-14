mod test_ERC20Token {
    use crate::chain_id::MAINNET;
    use crate::token::ERC20Token;
    use dep::ethereum::account_with_storage::StorageWithinBlock;
    use dep::ethereum::account_with_storage_recursive::RecursiveProof;
    use dep::ethereum::fixtures::mainnet::paris::usdc_circle::{
        account::account,
        header::{
            block_header_partial as paris_block_header_partial,
            block_header_rlp as paris_block_header_rlp, hash, number, receipts_root, state_root,
            transactions_root,
        },
        state_proof::proof_input_serialized as state_proof_input_serialized,
        storage::values,
        storage_proof::proofs_serialized,
    };
    use dep::ethereum::uint256::U256;
    use dep::std::test::OracleMock;

    #[test]
    fn success() {
        let result = StorageWithinBlock { block_hash: hash, account, values };
        let recursive_proof =
            RecursiveProof { key_hash: 1, verification_key: [0; 114], proof: [0; 93] };

        let _ = OracleMock::mock("get_storage_recursive").returns((
            result.serialize(), recursive_proof,
        ));
        let _ = OracleMock::mock("get_header").returns((
            paris_block_header_partial, paris_block_header_rlp,
        ));
        let _ = OracleMock::mock("get_proof").returns((
            account, state_proof_input_serialized, proofs_serialized[0],
        ));

        let usdc_token = ERC20Token {
            address: [
                0xa0, 0xb8, 0x69, 0x91, 0xc6, 0x21, 0x8b, 0x36, 0xc1, 0xd1, 0x9d, 0x4a, 0x2e, 0x9e,
                0xb0, 0xce, 0x36, 0x06, 0xeb, 0x48,
            ],
            balances_slot: U256::from_field(9),
            allowances_slot: U256::from_field(10),
            chain_id: MAINNET,
        };

        let circle_address = [
            0x55, 0xFE, 0x00, 0x2a, 0xef, 0xF0, 0x2F, 0x77, 0x36, 0x4d, 0xe3, 0x39, 0xa1, 0x29,
            0x29, 0x23, 0xA1, 0x58, 0x44, 0xB8,
        ];
        let block_number = 19000000;
        let balance = usdc_token.get_balance(circle_address, block_number);
        let expected_usdc_balnce_of_circle = U128::from_integer(125761774888720);
        assert_eq(expected_usdc_balnce_of_circle, balance);
    }
}
