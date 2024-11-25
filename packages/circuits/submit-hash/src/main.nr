use dep::std;
use dep::ecrecover;

fn main(
    // Token Balance
    address: Field,
    balance: Field,
    // Merkle Membership
    note_root: pub Field,
    index: Field,
    note_hash_path: [Field; 13],
    // Signature
    signature: [u8; 64],
    message_hash: [u8; 32],
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    // Token Data
    token_address: pub Field,
    timestamp: pub u64,
    // Hash
    hash: pub Field,
) -> pub (u64, Field, Field) {
    let recovered_address = ecrecover::ecrecover(pub_key_x, pub_key_y, signature, message_hash);
    assert(address == recovered_address);

    let commitment = std::hash::mimc::mimc_bn254([address, balance]);

    // Check that the input note commitment is in the root
    let new_root = std::merkle::compute_merkle_root(commitment, index, note_hash_path);
    assert(new_root == note_root);

    (timestamp, hash, token_address)
}
