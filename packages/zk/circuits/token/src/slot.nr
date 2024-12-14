use dep::ethereum::misc::types::Bytes32;
use dep::std::hash::keccak256;
use dep::ethereum::uint256::U256;

global STORAGE_KEY_HASH_INPUT_LENGTH = 64;

pub(crate) fn mapping(slot: U256, key: Bytes32) -> U256 {
    let mut vector: BoundedVec<u8, STORAGE_KEY_HASH_INPUT_LENGTH> = BoundedVec::new();
    vector.extend_from_array(key);
    vector.extend_from_array(U256::into(slot));
    U256::from(keccak256(vector.storage(), STORAGE_KEY_HASH_INPUT_LENGTH))
}

pub(crate) fn dynamic_array(slot: U256, size: Field, index: Field) -> U256 {
    let start: U256 = U256::from(keccak256(U256::into(slot), 32));
    dynamic_array_with_precalculated_slot(start, size, index)
}

pub(crate) fn dynamic_array_with_precalculated_slot(slot: U256, size: Field, index: Field) -> U256 {
    slot + U256::from_field(size * index)
}

pub(crate) fn struct_slot(slot: U256, offset: Field) -> U256 {
    slot + U256::from_field(offset)
}
