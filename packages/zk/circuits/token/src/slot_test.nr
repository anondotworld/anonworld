mod mapping {
    use crate::slot::mapping;
    use dep::ethereum::misc::bytes32::{address_to_bytes32, field_to_bytes32};
    use dep::ethereum::uint256::U256;

    #[test]
    fn adress_mapping() {
        let slot = U256::from_field(9);
        let address = [
            0x55, 0xfe, 0x00, 0x2a, 0xef, 0xf0, 0x2f, 0x77, 0x36, 0x4d, 0xe3, 0x39, 0xa1, 0x29, 0x29, 0x23, 0xa1, 0x58, 0x44, 0xb8
        ];
        assert_eq(
            U256::from(
                [
            0x57, 0xd1, 0x8a, 0xf7, 0x93, 0xd7, 0x30, 0x0c, 0x4b, 0xa4, 0x6d, 0x19, 0x2e, 0xc7, 0xaa, 0x09, 0x50, 0x70, 0xdd, 0xe6, 0xc5, 0x2c, 0x68, 0x7c, 0x6d, 0x0d, 0x92, 0xfb, 0x85, 0x32, 0xb3, 0x05
        ]
            ), mapping(slot, address_to_bytes32(address))
        );
    }

    #[test]
    fn mapping_of_mapping() {
        let slot = U256::from_field(1);
        let owner = [
            0x5d, 0x82, 0x72, 0x63, 0x05, 0x2a, 0x88, 0x64, 0x23, 0xdc, 0xb1, 0x75, 0xef, 0x9b, 0x74, 0x91, 0xcc, 0x92, 0xed, 0x24
        ];
        let spender = [
            0x00, 0x00, 0x00, 0x47, 0xbb, 0x99, 0xea, 0x4d, 0x79, 0x1b, 0xb7, 0x49, 0xd9, 0x70, 0xde, 0x71, 0xee, 0x0b, 0x1a, 0x34
        ];

        assert_eq(
            U256::from(
                [
            0x51, 0x5a, 0xd6, 0x04, 0x70, 0x94, 0xbd, 0x71, 0x0c, 0x10, 0x72, 0xcd, 0xa4, 0x7b, 0xc6, 0xcf, 0x43, 0x9c, 0x55, 0xdc, 0xf0, 0xb0, 0xd6, 0x0e, 0x8a, 0x9b, 0xe5, 0x57, 0xf1, 0x86, 0x81, 0x1c
        ]
            ), mapping(
                mapping(slot, address_to_bytes32(owner)),
                address_to_bytes32(spender)
            )
        );
    }

    #[test]
    fn uint_mapping() {
        let slot = U256::from_field(10);
        let uint = 0;
        let expected_slot = U256::from(
            [
            0x13, 0xda, 0x86, 0x00, 0x8b, 0xa1, 0xc6, 0x92, 0x2d, 0xae, 0xe3, 0xe0, 0x7d, 0xb9, 0x53, 0x05, 0xef, 0x49, 0xeb, 0xce, 0xd9, 0xf5, 0x46, 0x7a, 0x0b, 0x86, 0x13, 0xfc, 0xc6, 0xb3, 0x43, 0xe3
        ]
        );
        assert_eq(mapping(slot, field_to_bytes32(uint)), expected_slot);
    }
}

mod dynamic_array {
    use crate::slot::dynamic_array;
    use dep::ethereum::misc::{bytes32_test::MAX_FIELD_VALUE, bytes32::field_to_bytes32};
    use dep::ethereum::uint256::U256;

    #[test]
    fn index_zero() {
        let slot = U256::from_field(2);
        let expected_slot = U256::from(
            [
            0x40, 0x57, 0x87, 0xfa, 0x12, 0xa8, 0x23, 0xe0, 0xf2, 0xb7, 0x63, 0x1c, 0xc4, 0x1b, 0x3b, 0xa8, 0x82, 0x8b, 0x33, 0x21, 0xca, 0x81, 0x11, 0x11, 0xfa, 0x75, 0xcd, 0x3a, 0xa3, 0xbb, 0x5a, 0xce
        ]
        );
        assert_eq(expected_slot, dynamic_array(slot, 2, 0));
    }

    #[test]
    fn index_positive() {
        let slot = U256::from_field(2);
        let expected_slot = U256::from(
            [
            0x40, 0x57, 0x87, 0xfa, 0x12, 0xa8, 0x23, 0xe0, 0xf2, 0xb7, 0x63, 0x1c, 0xc4, 0x1b, 0x3b, 0xa8, 0x82, 0x8b, 0x33, 0x21, 0xca, 0x81, 0x11, 0x11, 0xfa, 0x75, 0xcd, 0x3a, 0xa3, 0xbb, 0x5a, 0xdc
        ]
        );
        assert_eq(expected_slot, dynamic_array(slot, 2, 7));
    }

    #[test(should_fail_with="attempt to add with overflow")]
    fn fail_overflow() {
        let slot = U256::from_field(6);
        let _ = dynamic_array(slot, 2, MAX_FIELD_VALUE);
    }
}

mod dynamic_array_with_precalculated_slot {
    use crate::slot::dynamic_array_with_precalculated_slot;
    use dep::ethereum::misc::{bytes32_test::MAX_FIELD_VALUE, bytes32::field_to_bytes32};
    use dep::ethereum::uint256::U256;

    #[test]
    fn index_zero() {
        let slot = U256::from_field(2);
        assert_eq(slot, dynamic_array_with_precalculated_slot(slot, 2, 0));
    }

    #[test]
    fn index_positive() {
        let slot = U256::from_field(2);
        let expected_slot = U256::from_field(2 + 2 * 7);
        assert_eq(expected_slot, dynamic_array_with_precalculated_slot(slot, 2, 7));
    }

    #[test]
    fn big_index() {
        let slot = U256::from([0x09; 32]);
        let expected_slot = U256::from(
            [
            0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x9, 0x0b, 0x5d, 0x14, 0xed, 9
        ]
        );
        assert_eq(expected_slot, dynamic_array_with_precalculated_slot(slot, 10, 1_000_000_000));
    }

    #[test(should_fail_with="attempt to add with overflow")]
    fn fail_overflow() {
        let slot = U256::from([0xfe; 32]);
        let _ = dynamic_array_with_precalculated_slot(slot, 2, MAX_FIELD_VALUE);
    }
}

mod struct_slot {
    use crate::slot::struct_slot;
    use dep::ethereum::misc::bytes32::field_to_bytes32;
    use dep::ethereum::uint256::U256;

    #[test]
    fn success() {
        let slot = U256::from_field(2);
        let expected_slot = U256::from(
            [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2
        ]
        );
        assert_eq(expected_slot, struct_slot(slot, 256));
    }

    #[test(should_fail_with="attempt to add with overflow")]
    fn overflow() {
        let slot = U256::from([0xff; 32]);
        let _ = struct_slot(slot, 256);
    }
}
