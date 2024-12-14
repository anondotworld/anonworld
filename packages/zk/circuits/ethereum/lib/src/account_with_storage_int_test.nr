// use crate::misc::types::Bytes32;
// use crate::chain::ETHEREUM_MAINNET_ID;
// use crate::account_with_storage::get_account_with_storage;
// use crate::fixtures::mainnet::{
//     paris::{
//     usdc_circle::{
//     header::{number, block_header_partial, block_header_rlp}, account::{account, address},
//     state_proof::proof_input_serialized as state_proof_input_serialized,
//     storage_proof::proofs_serialized, storage::{values, keys as storage_keys}
// },
//     usdc_uniswap::{storage::keys as usdc_uniswap_storage_keys}
// },
//     london::{
//     crypto_punks::{
//     header::{
//     block_header_partial as crypto_punks_block_header_partial,
//     block_header_rlp as crypto_punks_block_header_rlp, number as crypto_punks_number
// },
//     account::{address as crypto_punks_address, account as crypto_punks_account},
//     state_proof::proof_input_serialized as crypto_punks_state_proof_input_serialized
// }
// }
// };
// use dep::std::test::OracleMock;

// #[test]
// fn test_get_account_with_storage_success() {
//     let _ = OracleMock::mock("get_header").returns((block_header_partial, block_header_rlp));
//     let _ = OracleMock::mock("get_proof").returns((account, state_proof_input_serialized, proofs_serialized[0]));

//     let account_with_storage = get_account_with_storage(ETHEREUM_MAINNET_ID, number, address, storage_keys[0]);

//     assert_eq(block_header_partial.hash, account_with_storage.block_hash);

//     assert_eq(account.nonce, account_with_storage.account.nonce);
//     assert_eq(account.balance, account_with_storage.account.balance);
//     assert_eq(account.code_hash, account_with_storage.account.code_hash);
//     assert_eq(account.storage_root, account_with_storage.account.storage_root);

//     assert_eq(values[0], account_with_storage.values[0]);
// }

// #[test(should_fail_with = "Invalid node hash")]
// fn test_get_account_with_storage_invalid_state_root() {
//     let _ = OracleMock::mock("get_header").returns((crypto_punks_block_header_partial, crypto_punks_block_header_rlp));
//     let _ = OracleMock::mock("get_proof").returns((account, state_proof_input_serialized, proofs_serialized[0]));

//     let _ = get_account_with_storage(
//         ETHEREUM_MAINNET_ID,
//         crypto_punks_number,
//         address,
//         storage_keys[0]
//     );
// }

// #[test(should_fail_with = "Invalid node hash")]
// fn test_get_account_with_storage_invalid_storage_root() {
//     let _ = OracleMock::mock("get_header").returns((crypto_punks_block_header_partial, crypto_punks_block_header_rlp));
//     let _ = OracleMock::mock("get_proof").returns((crypto_punks_account, crypto_punks_state_proof_input_serialized, proofs_serialized[0]));

//     let _ = get_account_with_storage(
//         ETHEREUM_MAINNET_ID,
//         crypto_punks_number,
//         crypto_punks_address,
//         storage_keys[0]
//     );
// }

// #[test(should_fail_with = "Storage key does not match the argument")]
// fn test_get_account_with_storage_storage_key_does_not_match_the_argument() {
//     let _ = OracleMock::mock("get_header").returns((block_header_partial, block_header_rlp));
//     let _ = OracleMock::mock("get_proof").returns((account, state_proof_input_serialized, proofs_serialized[0]));

//     let _ = get_account_with_storage(
//         ETHEREUM_MAINNET_ID,
//         number,
//         address,
//         usdc_uniswap_storage_keys[0]
//     );
// }
