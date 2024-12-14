use crate::misc::fragment::Fragment;

pub fn byte_to_nibbles(byte: u8) -> (u8, u8) {
    let upper = byte / 16;
    let lower = byte - 16 * upper;

    (upper, lower)
}

pub fn bytes_to_nibbles<let MAX_NIBBLE_LEN: u32>(bytes: Fragment<MAX_NIBBLE_LEN, u8>) -> Fragment<MAX_NIBBLE_LEN, u8> {
    assert(
        MAX_NIBBLE_LEN >= 2 * bytes.length, "Bytes implicit data length must be at least 2 times larger than bytes explicit length"
    );

    let nibbles = &mut Fragment::new_with_length(2 * bytes.length, [0; MAX_NIBBLE_LEN]);
    bytes.each(
        |byte, i| {
        let (hi, lo) = byte_to_nibbles(byte);

        nibbles.set(2 * i, hi);
        nibbles.set(2 * i + 1, lo);
    }
    );

    *nibbles
}

pub fn nibbles_to_byte(upper: u8, lower: u8) -> u8 {
    assert(upper < 16, "Nibble value must be less than 16");
    assert(lower < 16, "Nibble value must be less than 16");

    upper * 16 + lower
}

pub fn nibbles_to_bytes<let BYTES_LEN: u32, let NIB_LEN: u32>(nibbles: [u8; NIB_LEN]) -> [u8; BYTES_LEN] {
    assert(NIB_LEN == 2 * BYTES_LEN, "Generic arguments don't match");

    let mut bytes = [0; BYTES_LEN];

    for i in 0..NIB_LEN / 2 {
        let byte = nibbles_to_byte(nibbles[2 * i], nibbles[2 * i + 1]);
        bytes[i] = byte;
    }

    bytes
}

pub fn right_pad<let N: u32>(arr: [u8; N]) -> BoundedVec<u8, N> {
    byte_value(arr)
}

pub fn left_to_right_padding<let N: u32>(nibbles: [u8; N]) -> ([u8; N], u32) {
    let mut BoundedVec {storage: shifted, len} = right_pad(nibbles);
    if (len % 2 == 1) {
        shift_right_by_one(&mut shifted);
        len += 1;
    }

    let shifted_by = N - len;
    (shifted, shifted_by)
}

pub fn shift_right_by_one<let N: u32>(arr: &mut [u8; N]) {
    assert(arr[N - 1] == 0, "Last element must be zero to shift the array right by one");

    let mut last = 0;
    for i in 0..N {
        let tmp = (*arr)[i];
        (*arr)[i] = last;
        last = tmp;
    }
}

pub(crate) fn left_byte_shift<let N: u32>(input: [u8; N], n: u32) -> [u8; N] {
    let mut out = [0; N];

    for i in 0..N {
        let index_ind = (((i + n) as u32) < (N as u32)) as u32;
        out[i] = (index_ind as u8) * input[index_ind * (i + n)];
    }

    out
}

// Converts big-endian byte array to a right-padded one.
pub(crate) fn byte_value<let N: u32>(in_value: [u8; N]) -> BoundedVec<u8, N> {
    let mut value_length = 0;

    for i in 0..N {
        let num_bytes_ind = (value_length == 0) as u32;
        let byte_ind = (in_value[i] != 0) as u32;
        value_length = num_bytes_ind * byte_ind * (N - i) + (1 - num_bytes_ind) * value_length;
    }

    let value = left_byte_shift(in_value, N - value_length);

    BoundedVec { storage: value, len: value_length }
}

pub fn add_bigint<let N: u32>(left: [u8; N], right: [u8; N]) -> [u8; N] {
    let mut carry: u32 = 0;
    let mut result: [u8; N] = [0; N];

    for j in 0..N {
        let index = N - j - 1;
        let sum = left[index] as u32 + right[index] as u32 + carry;
        result[index] = sum as u8;
        carry = sum >> 8;
    }

    assert(carry == 0, "Addition overflow");

    result
}
