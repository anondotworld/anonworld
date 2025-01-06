use dep::lib::{ecrecover, proof};

fn main(
    // Address Data
    signature: [u8; 64],
    message_hash: [u8; 32],
    pub_key_x: [u8; 32],
    pub_key_y: [u8; 32],
    // Storage Proof
    storage_hash: [u8; 32],
    storage_nodes: [[u8; 532]; 7],
    storage_leaf: [u8; 69],
    storage_depth: u32,
    storage_value: Field,
    // Verification Data
    chain_id: Field,
    block_number: Field,
    contract_address: Field,
    storage_slot: Field,
    // Balance Data
    verified_fid: Field,
) -> pub (Field, Field, Field, Field, Field, [u8; 32]) {
    let storage_slot_bytes: [u8; 32] = storage_slot.to_be_bytes();
    let address: [u8; 32] =
        ecrecover::ecrecover(pub_key_x, pub_key_y, signature, message_hash).to_be_bytes();

    let key = proof::get_storage_key([address, storage_slot_bytes]);
    let value = proof::get_storage_value(storage_value);

    proof::verify(
        key,
        value,
        storage_hash,
        storage_nodes,
        storage_leaf,
        storage_depth,
    );

    assert(storage_value.lt(verified_fid), "Attempt to verify too low FID");

    (verified_fid, chain_id, block_number, contract_address, storage_slot, storage_hash)
}
