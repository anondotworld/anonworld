global MAX_FIELD_VALUE = 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000000;

mod field_to_bytes32 {
    use crate::misc::bytes32::field_to_bytes32;
    use crate::misc::bytes32_test::MAX_FIELD_VALUE;

    #[test]
    fn zero() {
        assert_eq([0; 32], field_to_bytes32(0));
    }

    #[test]
    fn one() {
        assert_eq(
            [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1
        ], field_to_bytes32(1)
        );
    }

    #[test]
    fn medium() {
        assert_eq(
            [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xab, 0xcd, 0xef, 0x01, 0x23, 0x45, 0x67, 0x89
        ], field_to_bytes32(0xabcdef0123456789)
        );
    }

    #[test]
    fn max() {
        assert_eq(
            [
            0x30, 0x64, 0x4e, 0x72, 0xe1, 0x31, 0xa0, 0x29, 0xb8, 0x50, 0x45, 0xb6, 0x81, 0x81, 0x58, 0x5d, 0x28, 0x33, 0xe8, 0x48, 0x79, 0xb9, 0x70, 0x91, 0x43, 0xe1, 0xf5, 0x93, 0xf0, 0x00, 0x00, 0x00
        ], field_to_bytes32(MAX_FIELD_VALUE)
        );
    }

    #[test]
    fn overflow() {
        assert_eq([0; 32], field_to_bytes32(MAX_FIELD_VALUE + 1));
    }
}
