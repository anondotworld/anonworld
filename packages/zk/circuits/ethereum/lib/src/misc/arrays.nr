use dep::std::{mem::zeroed, wrapping_add};
use crate::misc::fragment::Fragment;

pub fn alter_array<let ARRAY_LEN: u32>(array: [u8; ARRAY_LEN]) -> [u8; ARRAY_LEN] {
    let mut copy = array.map(|x| x);
    copy[0] = wrapping_add(copy[0], 1);
    copy
}

pub fn alter_fragment<let MAX_LEN: u32>(fragment: Fragment<MAX_LEN, u8>) -> Fragment<MAX_LEN, u8> {
    let mut copy = fragment;
    copy.set(0, wrapping_add(copy.at(0), 1));
    copy
}

pub fn resize<TItem, let NEW_LEN: u32, let OLD_LEN: u32>(src: [TItem; OLD_LEN]) -> [TItem; NEW_LEN] {
    assert(NEW_LEN >= OLD_LEN, "New length must be greater than or equal to old length");
    let mut dest = [zeroed(); NEW_LEN];
    for i in 0..OLD_LEN {
        dest[i] = src[i];
    }
    dest
}

pub(crate) fn memcpy_up_to_length<TItem, let SRC_LEN: u32, let DEST_LEN: u32>(dest: &mut [TItem; DEST_LEN], src: [TItem; SRC_LEN], offset: u32, length: u32) {
    assert(length <= DEST_LEN, "Destination index out of bound");
    assert(offset + length <= SRC_LEN, "Source index out of bound");
    for i in 0..DEST_LEN {
        if i < length {
            (*dest)[i] = src[offset + i];
        }
    }
}

// Fills destination array with content of source array starting from the offset in source array.
pub(crate) fn memcpy<TItem, let SRC_LEN: u32, let DEST_LEN: u32>(dest: &mut [TItem; DEST_LEN], src: [TItem; SRC_LEN], offset: u32) {
    memcpy_up_to_length(dest, src, offset, DEST_LEN);
}

pub fn subarray_inferred_len<TItem, let SRC_LEN: u32, let DEST_LEN: u32>(src: [TItem; SRC_LEN], offset: u32) -> [TItem; DEST_LEN] {
    let mut dest = [zeroed(); DEST_LEN];
    memcpy(&mut dest, src, offset);
    dest
}

pub fn sub_array_equals_up_to_length<TItem, let SUBARRAY_LEN: u32, let ARRAY_LEN: u32>(
    subarray: [TItem; SUBARRAY_LEN],
    array: [TItem; ARRAY_LEN],
    offset: u32,
    length: u32
) -> bool where TItem: Eq {
    assert(length <= SUBARRAY_LEN, "Subarray index out of bound");
    assert(offset + length <= ARRAY_LEN, "Array index out of bound");
    let mut result = true;
    for i in 0..SUBARRAY_LEN {
        if i < length {
            result &= subarray[i] == array[offset + i];
        }
    }
    result
}

pub fn sub_array_equals<TItem, let SUBARRAY_LEN: u32, let ARRAY_LEN: u32>(
    subarray: [TItem; SUBARRAY_LEN],
    array: [TItem; ARRAY_LEN],
    offset: u32
) -> bool where TItem: Eq {
    assert(offset + SUBARRAY_LEN <= ARRAY_LEN, "Array index out of bound");
    let mut result = true;
    for i in 0..SUBARRAY_LEN {
        result &= subarray[i] == array[offset + i];
    }
    result
}
