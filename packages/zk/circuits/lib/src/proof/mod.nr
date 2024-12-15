use crate::bytes::{byte_to_nibbles, bytes_as_nibbles};
use crate::rlp::{
    decode_rlp_header, decode_rlp_list_fragments, encode_rlp_string, RLP_HEADER_TYPE_LIST,
    RlpFragment,
};
use dep::std::hash::keccak256;

pub fn verify(
    key: [u8; 32],
    value: [u8; 32],
    storage_root: [u8; 32],
    nodes: [[u8; 532]; 7],
    leaf: [u8; 69],
    depth: u64,
) {
    let key = keccak256(key, 32);
    let nibbles = bytes_as_nibbles(key);

    let mut key_index = 0;
    let mut curr_hash = storage_root;
    for i in 0..7 {
        if i < depth - 1 {
            let node = nodes[i];

            // Decode RLP header
            let rlp_header = decode_rlp_header(node);
            assert(rlp_header.data_type == RLP_HEADER_TYPE_LIST, "Invalid data type");

            // Validate node hash
            let node_hash: [u8; 32] = get_node_hash(rlp_header, node);
            assert(node_hash == curr_hash, "Invalid hash");

            // Create next hash
            let rlp_list: BoundedVec<RlpFragment, 17> = decode_rlp_list_fragments(rlp_header, node);
            if rlp_list.len() == 17 {
                // Branch Node
                let curr_nibble = nibbles[key_index] as u32;
                let rlp_item = rlp_list.get(curr_nibble);
                assert(rlp_item.length == 32, "Invalid length");
                for i in 0..32 {
                    curr_hash[i] = node[rlp_item.offset + i];
                }
                key_index += 1;
            } else if rlp_list.len() == 2 {
                // TODO: Extension Node
            }
        }
    }

    // Verify leaf
    let rlp_header = decode_rlp_header(leaf);
    assert(rlp_header.data_type == RLP_HEADER_TYPE_LIST, "Invalid data type");

    let node_len = rlp_header.length + rlp_header.offset;
    assert(node_len <= leaf.len(), "Invalid length");

    let resolved_hash = keccak256(leaf, node_len);
    assert(resolved_hash == curr_hash, "Invalid hash");

    let rlp_list: BoundedVec<RlpFragment, 2> = decode_rlp_list_fragments(rlp_header, leaf);
    assert(rlp_list.len() == 2, "Invalid length");

    let leaf_key_item = rlp_list.get(0);
    let (parity, _) = byte_to_nibbles(leaf[leaf_key_item.offset]);
    assert((parity == 2) | (parity == 3), "Invalid parity");

    let mut leaf_key_part: [u8; 30] = [0; 30];
    for i in 0..30 {
        leaf_key_part[i] = leaf[leaf_key_item.offset + i];
    }
    let (leaf_key_prefix, leaf_key) = bytes_as_nibbles(leaf_key_part).as_slice().pop_front();
    assert((leaf_key_prefix == 2) | (leaf_key_prefix == 3), "Leaf parity prefix must be 2 or 3");

    let mut leaf_key_ending: [u8; 59] = [0; 59];
    for i in 0..59 {
        if key_index + i < nibbles.len() {
            leaf_key_ending[i] = nibbles[key_index + i];
        }
    }
    assert(leaf_key.as_array() == leaf_key_ending, "Key mismatch in the leaf");

    key_index += leaf_key.len();
    assert(key_index == nibbles.len(), "Expected to consume all key nibbles");

    let leaf_value = rlp_list.get(1);
    for i in 0..32 {
        assert(leaf[leaf_value.offset + i] == value[i], "Value mismatch");
    }
}

unconstrained fn get_node_hash(rlp_header: RlpFragment, node: [u8; 532]) -> [u8; 32] {
    let node_len = rlp_header.length + rlp_header.offset;
    let resolved_hash: [u8; 32] = keccak256(node, node_len);
    resolved_hash
}

pub fn get_storage_key<let N: u32>(values: [[u8; 32]; N]) -> [u8; 32] {
    let mut input_slice = values[0].as_slice();
    for i in 1..N {
        input_slice = input_slice.append(values[i]);
    }
    let input: [u8; N * 32] = input_slice.as_array();
    let key = keccak256(input, input.len());
    key
}

pub fn get_storage_value(field: Field) -> [u8; 32] {
    let value_bytes: [u8; 32] = field.to_be_bytes();
    let value_rlp = encode_rlp_string(value_bytes);
    value_rlp
}
