use dep::std;
use dep::ecrecover;

fn main(
    address: Field,
    balance: Field,
    // Merkle membership proof
    note_root: pub Field,
    index: Field,
    note_hash_path: [Field; 11],
    // Cast Data
    timestamp: pub u64,
    hash: pub Field,
    token_address: pub Field,
    signature: [u8; 64],
    message_hash: [u8; 32],
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
) -> pub (u64, Field, Field) {
    let recovered_address = ecrecover::ecrecover(pub_key_x, pub_key_y, signature, message_hash);
    assert(address == recovered_address);

    let commitment = std::hash::mimc_bn254([address, balance]);

    // Check that the input note commitment is in the root
    let new_root = compute_root_from_leaf(commitment, index, note_hash_path);
    assert(new_root == note_root);

    (timestamp, hash, token_address)
}

// Returns the root of the tree from the provided leaf and its hashpath, using mimc hash
fn compute_root_from_leaf(leaf: Field, index: Field, hash_path: [Field; 11]) -> Field {
    let n = hash_path.len();
    let index_bits = index.to_le_bits(n as u32);
    let mut current = leaf;
    for i in 0..n {
        let path_bit = index_bits[i] as bool;
        let (hash_left, hash_right) = if path_bit {
            (hash_path[i], current)
        } else {
            (current, hash_path[i])
        };

        current = std::hash::mimc_bn254([hash_left, hash_right]);
    }
    current
}
