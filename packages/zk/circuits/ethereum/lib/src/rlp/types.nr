use crate::misc::{arrays::sub_array_equals_up_to_length, fragment::Fragment};
use crate::misc::bytes::byte_value;
use crate::misc::types::{Address, ADDRESS_LENGTH, Bytes32, BYTES32_LENGTH};
use dep::u2b::{u32_to_u8, u64_to_u8};

// Enum for RLP data type
global STRING: u32 = 0;
global LIST: u32 = 1;

type RlpList<let MAX_FIELDS: u32> = BoundedVec<RlpFragment, MAX_FIELDS>;

struct RlpHeader {
    offset: u32,
    length: u32,
    data_type: u32,
}

impl Eq for RlpHeader {
    fn eq(self, other: Self) -> bool {
        (self.offset == other.offset)
            & (self.length == other.length)
            & (self.data_type == other.data_type)
    }
}

struct RlpFragment {
    offset: u32,
    length: u32,
    data_type: u32,
}

impl RlpFragment {
    fn assert_eq_bytes<let FIELD_NAME_LEN: u32, let MAX_RLP_LEN: u32, let MAX_VALUE_LEN: u32>(
        self,
        field_name: str<FIELD_NAME_LEN>,
        rlp: Fragment<MAX_RLP_LEN, u8>,
        value: Fragment<MAX_VALUE_LEN, u8>,
    ) {
        assert(self.data_type == STRING, f"{field_name}: Invalid RLP type");
        assert(self.length == value.length, f"{field_name}: Invalid RLP length");
        assert(
            rlp.subfragment(self.offset, self.length).eq(value),
            f"{field_name}: Invalid RLP value",
        );
    }

    fn assert_eq_bounded_vec<let FIELD_NAME_LEN: u32, let MAX_RLP_LEN: u32, let MAX_VALUE_LEN: u32>(
        self,
        field_name: str<FIELD_NAME_LEN>,
        rlp: Fragment<MAX_RLP_LEN, u8>,
        value: BoundedVec<u8, MAX_VALUE_LEN>,
    ) {
        self.assert_eq_bytes(field_name, rlp, Fragment::from_vec(value));
    }

    fn assert_empty_string<let FIELD_NAME_LEN: u32, let MAX_RLP_LEN: u32>(
        self,
        field_name: str<FIELD_NAME_LEN>,
    ) {
        assert(self.data_type == STRING, f"{field_name}: Invalid RLP type");
        assert(self.length == 0, f"{field_name}: Expected empty string");
    }

    fn assert_eq_u1<let FIELD_NAME_LEN: u32, let MAX_RLP_LEN: u32>(
        self,
        field_name: str<FIELD_NAME_LEN>,
        rlp: Fragment<MAX_RLP_LEN, u8>,
        value: u1,
    ) {
        self.assert_eq_bytes(field_name, rlp, Fragment::from_array([value as u8]));
    }

    fn assert_eq_u8<let FIELD_NAME_LEN: u32, let MAX_RLP_LEN: u32>(
        self,
        field_name: str<FIELD_NAME_LEN>,
        rlp: Fragment<MAX_RLP_LEN, u8>,
        value: u8,
    ) {
        self.assert_eq_bounded_vec(field_name, rlp, byte_value([value]));
    }

    fn assert_eq_u32<let FIELD_NAME_LEN: u32, let MAX_RLP_LEN: u32>(
        self,
        field_name: str<FIELD_NAME_LEN>,
        rlp: Fragment<MAX_RLP_LEN, u8>,
        value: u32,
    ) {
        self.assert_eq_bounded_vec(field_name, rlp, byte_value(u32_to_u8(value)));
    }

    fn assert_eq_u64<let FIELD_NAME_LEN: u32, let MAX_RLP_LEN: u32>(
        self,
        field_name: str<FIELD_NAME_LEN>,
        rlp: Fragment<MAX_RLP_LEN, u8>,
        value: u64,
    ) {
        self.assert_eq_bounded_vec(field_name, rlp, byte_value(u64_to_u8(value)));
    }

    fn assert_eq_u128<let FIELD_NAME_LEN: u32, let MAX_RLP_LEN: u32>(
        self,
        field_name: str<FIELD_NAME_LEN>,
        rlp: Fragment<MAX_RLP_LEN, u8>,
        value: U128,
    ) {
        self.assert_eq_bounded_vec(field_name, rlp, byte_value(value.to_be_bytes()));
    }

    fn assert_eq_address<let FIELD_NAME_LEN: u32, let MAX_RLP_LEN: u32>(
        self,
        field_name: str<FIELD_NAME_LEN>,
        rlp: Fragment<MAX_RLP_LEN, u8>,
        value: Address,
    ) {
        self.assert_eq_bytes(field_name, rlp, Fragment::from_array(value));
    }

    fn assert_eq_bytes32<let FIELD_NAME_LEN: u32, let MAX_RLP_LEN: u32>(
        self,
        field_name: str<FIELD_NAME_LEN>,
        rlp: Fragment<MAX_RLP_LEN, u8>,
        value: Bytes32,
    ) {
        self.assert_eq_bytes(field_name, rlp, Fragment::from_array(value));
    }
}

impl Default for RlpFragment {
    fn default() -> Self {
        RlpFragment { offset: 0, length: 0, data_type: 0 }
    }
}

impl Eq for RlpFragment {
    fn eq(self, other: Self) -> bool {
        (self.offset == other.offset)
            & (self.length == other.length)
            & (self.data_type == other.data_type)
    }
}
