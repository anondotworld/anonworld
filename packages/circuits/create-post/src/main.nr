use dep::std;
use dep::ecrecover;

fn main(
    // Token Balance
    address: Field,
    balance: Field,
    // Merkle Membership
    note_root: pub Field,
    index: Field,
    note_hash_path: [Field; 12],
    // Signature
    signature: [u8; 64],
    message_hash: [u8; 32],
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    // Token Data
    token_address: pub Field,
    timestamp: pub u64,
    // Post
    text: pub [Field; 16],
    embed_1: pub [Field; 16],
    embed_2: pub [Field; 16],
    quote: pub Field,
    channel: pub Field,
    parent: pub Field,
    reveal_hash: pub Field,
) -> pub (u64, [Field; 16], [Field; 16], [Field; 16], Field, Field, Field, Field, Field) {
    let recovered_address = ecrecover::ecrecover(pub_key_x, pub_key_y, signature, message_hash);
    assert(address == recovered_address);

    let commitment = std::hash::mimc_bn254([address, balance]);

    // Check that the input note commitment is in the root
    let new_root = compute_root_from_leaf(commitment, index, note_hash_path);
    assert(new_root == note_root);

    (timestamp, text, embed_1, embed_2, quote, channel, parent, token_address, reveal_hash)
}

// Returns the root of the tree from the provided leaf and its hashpath, using mimc hash
fn compute_root_from_leaf(leaf: Field, index: Field, hash_path: [Field; 12]) -> Field {
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
