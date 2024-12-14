mod rlp_fragment {
    mod assert_eq_bytes {
        use crate::rlp::types::{STRING, LIST, RlpFragment};
        use crate::misc::{arrays::alter_fragment, fragment::Fragment};

        global bytes = Fragment::new_with_length(2, [0x12, 0x34, 0x00]);
        global encoded_bytes = bytes;
        global fragment = RlpFragment { offset: 0, length: bytes.length, data_type: STRING };

        #[test]
        fn success() {
            fragment.assert_eq_bytes("Field", encoded_bytes, bytes)
        }

        #[test(should_fail_with = "Field: Invalid RLP type")]
        fn invalid_type() {
            let mut invalid_type_fragment = fragment;
            invalid_type_fragment.data_type = LIST;

            invalid_type_fragment.assert_eq_bytes("Field", encoded_bytes, bytes)
        }

        #[test(should_fail_with = "Field: Invalid RLP length")]
        fn invalid_length() {
            let mut invalid_length_fragment = fragment;
            invalid_length_fragment.length += 1;

            invalid_length_fragment.assert_eq_bytes("Field", encoded_bytes, bytes)
        }

        #[test(should_fail_with = "Field: Invalid RLP length")]
        fn invalid_length_given() {
            let mut invalid_length_bytes = bytes;
            invalid_length_bytes.push_back(0x00);
            fragment.assert_eq_bytes("Field", encoded_bytes, invalid_length_bytes)
        }

        #[test(should_fail_with = "Field: Invalid RLP value")]
        fn invalid_value() {
            fragment.assert_eq_bytes("Field", encoded_bytes, alter_fragment(bytes))
        }
    }

    mod assert_eq_bounded_vec {
        use crate::rlp::types::{STRING, LIST, RlpFragment};
        use crate::misc::{arrays::alter_array, fragment::Fragment};

        global bytes = [0x12, 0x34];
        global length = bytes.len();
        global bounded_vec = BoundedVec { storage: bytes, len: length };
        global encoded_bytes = Fragment::from_array(bytes);
        global fragment = RlpFragment { offset: 0, length, data_type: STRING };

        #[test]
        fn success_short() {
            let short_fragment = RlpFragment { offset: 0, length: 1, data_type: STRING };
            let short_bounded_vec = BoundedVec { storage: bytes, len: 1 };

            short_fragment.assert_eq_bounded_vec("Field", encoded_bytes, short_bounded_vec)
        }

        #[test]
        fn success() {
            fragment.assert_eq_bounded_vec("Field", encoded_bytes, bounded_vec)
        }

        #[test(should_fail_with = "Field: Invalid RLP length")]
        fn invalid_length() {
            let mut invalid_length_fragment = fragment;
            invalid_length_fragment.length = 1;

            invalid_length_fragment.assert_eq_bounded_vec("Field", encoded_bytes, bounded_vec)
        }

        #[test(should_fail_with = "Field: Invalid RLP value")]
        fn invalid_value() {
            let mut invalid_value_bounded_vec = bounded_vec;
            invalid_value_bounded_vec.storage = alter_array(bytes);

            fragment.assert_eq_bounded_vec("Field", encoded_bytes, invalid_value_bounded_vec)
        }
    }

    mod assert_empty_string {
        use crate::rlp::types::{STRING, LIST, RlpFragment};

        global fragment = RlpFragment { offset: 0, length: 0, data_type: STRING };

        #[test]
        fn success() {
            fragment.assert_empty_string("Field")
        }

        #[test(should_fail_with = "Field: Invalid RLP type")]
        fn invalid_type() {
            let mut invalid_type_fragment = fragment;
            invalid_type_fragment.data_type = LIST;

            invalid_type_fragment.assert_empty_string("Field")
        }

        #[test(should_fail_with = "Field: Expected empty string")]
        fn invalid_length() {
            let mut invalid_length_fragment = fragment;
            invalid_length_fragment.length = 1;

            invalid_length_fragment.assert_empty_string("Field")
        }
    }

    mod assert_eq_u1 {
        use crate::rlp::types::{STRING, RlpFragment};
        use crate::misc::fragment::Fragment;

        global bit_value: u1 = 0x01;
        global encoded_value = Fragment::from_array([0x01 as u8]);
        global fragment = RlpFragment { offset: 0, length: 1, data_type: STRING };

        #[test]
        fn succes() {
            fragment.assert_eq_u1("Field", encoded_value, bit_value)
        }

        #[test(should_fail_with = "Field: Invalid RLP length")]
        fn invalid_length() {
            let mut invalid_length_fragment = fragment;
            invalid_length_fragment.length = 2;

            invalid_length_fragment.assert_eq_u1("Field", encoded_value, bit_value)
        }

        #[test(should_fail_with = "Field: Invalid RLP value")]
        fn invalid_value() {
            fragment.assert_eq_u1("Field", encoded_value, bit_value - 1)
        }

        #[test(should_fail_with = "Field: Invalid RLP value")]
        fn invalid_value_exceeding_bit() {
            let invalid_over_bit_encoded_value = Fragment::from_array([0x11]);
            fragment.assert_eq_u1("Field", invalid_over_bit_encoded_value, bit_value)
        }
    }

    mod assert_eq_u8 {
        use crate::rlp::types::{STRING, RlpFragment};
        use crate::misc::fragment::Fragment;

        global value = 0x10;
        global encoded_value = Fragment::from_array([value]);
        global fragment = RlpFragment { offset: 0, length: 1, data_type: STRING };

        #[test]
        fn success() {
            fragment.assert_eq_u8("Field", encoded_value, value)
        }

        #[test(should_fail_with = "Field: Invalid RLP length")]
        fn invalid_length() {
            let mut invalid_length_fragment = fragment;
            invalid_length_fragment.length = 2;

            invalid_length_fragment.assert_eq_u8("Field", encoded_value, value)
        }

        #[test(should_fail_with = "Field: Invalid RLP value")]
        fn invalid_value() {
            fragment.assert_eq_u8("Field", encoded_value, value + 1)
        }
    }

    mod assert_eq_u32 {
        use crate::rlp::types::{STRING, RlpFragment};
        use crate::misc::fragment::Fragment;

        global value = 0x10000000;
        global encoded_value = Fragment::from_array([0x10, 0x00, 0x00, 0x00]);
        global fragment = RlpFragment { offset: 0, length: 4, data_type: STRING };

        #[test]
        fn success() {
            fragment.assert_eq_u32("Field", encoded_value, value)
        }

        #[test(should_fail_with = "Field: Invalid RLP length")]
        fn invalid_length() {
            let short_value = 0x10;
            fragment.assert_eq_u32("Field", encoded_value, short_value)
        }

        #[test(should_fail_with = "Field: Invalid RLP value")]
        fn invalid_value() {
            fragment.assert_eq_u32("Field", encoded_value, value + 1)
        }
    }

    mod assert_eq_u64 {
        use crate::rlp::types::{STRING, RlpFragment};
        use crate::misc::fragment::Fragment;

        global value = 0x1000000000000000;
        global encoded_value = Fragment::from_array([0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        global fragment = RlpFragment { offset: 0, length: 8, data_type: STRING };

        #[test]
        fn success() {
            fragment.assert_eq_u64("Field", encoded_value, value)
        }

        #[test(should_fail_with = "Field: Invalid RLP length")]
         fn invalid_length() {
            let short_value = 0x10;
            fragment.assert_eq_u64("Field", encoded_value, short_value)
        }

        #[test(should_fail_with = "Field: Invalid RLP value")]
         fn invalid_value() {
            fragment.assert_eq_u64("Field", encoded_value, value + 1)
        }
    }

    mod assert_eq_u128 {
        use crate::rlp::types::{STRING, RlpFragment};
        use crate::misc::fragment::Fragment;

        global value = U128::from_integer(0x10000000000000000000000000000000);
        global encoded_value = Fragment::from_array([0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        global fragment = RlpFragment { offset: 0, length: 16, data_type: STRING };

        #[test]
        fn success() {
            fragment.assert_eq_u128("Field", encoded_value, value)
        }

        #[test(should_fail_with = "Field: Invalid RLP length")]
        fn invalid_length() {
            let short_value = U128::from_integer(0x10);
            fragment.assert_eq_u128("Field", encoded_value, short_value)
        }

        #[test(should_fail_with = "Field: Invalid RLP value")]
        fn invalid_value() {
            fragment.assert_eq_u128("Field", encoded_value, value + U128::from_integer(1))
        }
    }

    mod assert_eq_address {
        use crate::rlp::types::{STRING, RlpFragment};
        use crate::misc::types::Address;
        use crate::misc::{arrays::alter_array, fragment::Fragment};
        use crate::fixtures::mainnet::london::crypto_punks::account::address;

        global address_fragment = Fragment::from_array(address);
        global fragment = RlpFragment { offset: 0, length: 20, data_type: STRING };

        #[test]
        fn success() {
            fragment.assert_eq_address("Field", address_fragment, address)
        }

        #[test(should_fail_with = "Field: Invalid RLP length")]
        fn invalid_length() {
            let mut invalid_length_fragment = fragment;
            invalid_length_fragment.length = 2;

            invalid_length_fragment.assert_eq_address("Field", address_fragment, address)
        }

        #[test(should_fail_with = "Field: Invalid RLP value")]
        fn invalid_value() {
            fragment.assert_eq_address("Field", address_fragment, alter_array(address))
        }
    }

    mod assert_eq_bytes32 {
        use crate::rlp::types::{STRING, RlpFragment};
        use crate::misc::types::Bytes32;
        use crate::misc::{arrays::alter_array, fragment::Fragment};
        use crate::fixtures::mainnet::frontier::first::header::hash;

        global bytes = hash;
        global bytes_fragment = Fragment::from_array(bytes);
        global fragment = RlpFragment { offset: 0, length: 32, data_type: STRING };

        #[test]
        fn success() {
            fragment.assert_eq_bytes32("Field", bytes_fragment, bytes)
        }

        #[test(should_fail_with = "Field: Invalid RLP length")]
        fn invalid_length() {
            let mut invalid_length_fragment = fragment;
            invalid_length_fragment.length = 2;

            invalid_length_fragment.assert_eq_bytes32("Field", bytes_fragment, bytes)
        }

        #[test(should_fail_with = "Field: Invalid RLP value")]
        fn invalid_value() {
            fragment.assert_eq_bytes32("Field", bytes_fragment, alter_array(bytes))
        }
    }
}
