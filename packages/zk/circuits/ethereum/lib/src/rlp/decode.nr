use dep::std::wrapping_sub;
use crate::rlp::types::{RlpList, RlpFragment, RlpHeader, STRING, LIST};
use crate::misc::fragment::Fragment;

// Maximum number of bytes required to represent entity length.
// This means that this library can only decode RLP entities with a length of up to 2^16 - 1 bytes.
global MAX_LEN_IN_BYTES: u32 = 2;

pub fn extract_payload_len<let N: u32>(data: Fragment<N, u8>, lenlen: u32) -> u32 {
    assert(lenlen <= MAX_LEN_IN_BYTES, "Length of length exceeds maximum");
    assert(lenlen <= data.length, "Length of length exceeds input length");
    assert(lenlen != 0, "Length of length is zero");

    let mut payload_length = 0;

    for i in 0..MAX_LEN_IN_BYTES {
        if (i < lenlen & i < data.length) {
            payload_length = data.at(i) as u32 + payload_length * 256;
        }
    }

    payload_length
}

pub fn decode_to_rlp_header<let N: u32>(data: Fragment<N, u8>) -> RlpHeader {
    let mut data = data;
    let prefix = data.pop_front();

    if (prefix < 0x80) { // single byte
        RlpHeader { offset: 0, length: 1, data_type: STRING }
    } else if (prefix < 0xb8) { // [0, 55] byte string
        let offset = 1;
        let length = wrapping_sub(prefix, 0x80) as u32;
        assert(offset + length <= N, "Decoded length of short string exceeds input length");

        RlpHeader { offset, length, data_type: STRING }
    } else if (prefix < 0xc0) { // > 55 byte string
        let offset = wrapping_sub(1 + prefix, 0xb7) as u32;
        let length = extract_payload_len(data, wrapping_sub(prefix, 0xb7) as u32);
        assert(offset + length <= N, "Decoded length of long string exceeds input length");

        RlpHeader { offset, length, data_type: STRING }
    } else if (prefix < 0xf8) { // [0, 55] byte list
        let offset = 1;
        let length = wrapping_sub(prefix, 0xc0) as u32;
        assert(offset + length <= N, "Decoded length of short list exceeds input length");

        RlpHeader { offset, length, data_type: LIST }
    } else { // > 55 byte list
        let offset = wrapping_sub(1 + prefix, 0xf7) as u32;
        let length = extract_payload_len(data, wrapping_sub(prefix, 0xf7) as u32);
        assert(offset + length <= N, "Decoded length of long list exceeds input length");

        RlpHeader { offset, length, data_type: LIST }
    }
}

pub fn decode_string<let N: u32>(input: Fragment<N, u8>) -> RlpFragment {
    let mut RlpHeader {offset, length, data_type} = decode_to_rlp_header(input);
    assert(data_type == STRING, "Wrong data type");

    let total_len = length + offset;
    assert(total_len <= input.length, "Total length exceeds input length");

    RlpFragment { offset, length, data_type: STRING }
}

// Strings are decoded and offsets point to the start of raw values, while list offsets point to the start of the RLP header.
pub fn decode_list<let N: u32, let MAX_FIELDS: u32>(data: Fragment<N, u8>) -> RlpList<MAX_FIELDS> {
    let mut rlp_list: RlpList<MAX_FIELDS> = BoundedVec::new();

    let RlpHeader {offset, length, data_type} = decode_to_rlp_header(data);
    assert(data_type == LIST, "Expected a list");

    let total_len = length + offset;
    assert(total_len <= data.length, "Total length exceeds input length");

    let mut current_offset = offset;
    for _ in 0..MAX_FIELDS {
        if (current_offset < total_len) {
            let header: Fragment<N, u8> = data.subfragment(current_offset, data.length - current_offset);

            let RlpHeader {offset: field_off, length: field_len, data_type: field_type} = decode_to_rlp_header(header);

            let mut offset = current_offset;
            let mut length = field_len;
            if (field_type == STRING) {
                offset += field_off;
            } else {
                length += field_off;
            }

            rlp_list.push(RlpFragment { offset, length, data_type: field_type });

            current_offset += field_off + field_len;
        }
    }
    assert(current_offset == total_len, "Inconsistent rlp length");

    rlp_list
}

// The version of decode_list that is cheaper to call, but only works for lists of small strings (<= 55 bytes).
pub fn decode_list_of_small_strings<let N: u32, let NUM_FIELDS: u32>(data: Fragment<N, u8>) -> RlpList<NUM_FIELDS> {
    let mut rlp_list: RlpList<NUM_FIELDS> = BoundedVec::new();

    let RlpHeader {offset, length, data_type} = decode_to_rlp_header(data);
    assert(data_type == LIST, "Expected a list");

    let total_len = length + offset;
    assert(total_len <= data.length, "Total length exceeds input length");

    let mut current_offset = offset;
    for _ in 0..NUM_FIELDS {
        if (current_offset < total_len) {
            let first_byte = data.at(current_offset);

            let (field_off, field_len) = get_small_string_offset_and_length(first_byte);
            rlp_list.push(RlpFragment { offset: current_offset + field_off, length: field_len, data_type: STRING });

            current_offset += field_off + field_len;
        }
    }
    assert(current_offset == total_len, "Inconsistent rlp length");

    rlp_list
}

pub fn get_small_string_offset_and_length(first_byte: u8) -> (u32, u32) {
    assert(first_byte < 0xb8, "Element is not a string of length < 56 bytes");

    if (first_byte < 0x80) {
        (0, 1)
    } else {
        (1, wrapping_sub(first_byte as u32, 0x80))
    }
}
