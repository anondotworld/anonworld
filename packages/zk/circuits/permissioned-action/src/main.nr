use dep::std::hash::poseidon2::Poseidon2::hash;
use ecrecover;
use merkle_tree::merkle::MerkleTree;

fn poseidon2_hasher(leaves: [Field; 2]) -> Field {
    hash([leaves[0], leaves[1]], 2)
}

fn main(
    // Tree Data
    root: pub Field,
    index: Field,
    path: [Field; 13],
    // Signature Data
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    signature: [u8; 64],
    message_hash: pub [u8; 32],
) {
    let address = ecrecover::ecrecover(pub_key_x, pub_key_y, signature, message_hash);
    let mt = MerkleTree::from(root, poseidon2_hasher);
    mt.membership(address, index, path);
}
