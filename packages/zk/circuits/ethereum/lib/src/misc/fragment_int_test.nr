mod u8_fragment {
    use crate::misc::fragment::Fragment;

    #[test]
    fn success() {
        let data: [u8; 5] = [1, 2, 3, 4, 5];
        let mut fragment = Fragment::from_array(data);
        assert_eq(fragment.is_empty(), false);
        assert_eq(fragment.length, 5);
        assert_eq(fragment.at(0), 1);

        fragment.set(0, 10);
        assert_eq(fragment.at(0), 10);

        fragment = fragment.subfragment(1, 3);
        assert_eq(fragment.at(0), 2);

        let data: [u8; 3] = fragment.to_array();
        assert_eq(data, [2, 3, 4]);
    }
}

mod Field_fragment {
    use crate::misc::{fragment::Fragment, bytes32_test::MAX_FIELD_VALUE};

    #[test]
    fn success() {
        let data: [Field; 5] = [1_000_000, 2, 3, 4, 5];
        let mut fragment = Fragment::from_array(data);
        assert_eq(fragment.is_empty(), false);
        assert_eq(fragment.length, 5);
        assert_eq(fragment.at(0), 1_000_000);

        fragment.set(0, MAX_FIELD_VALUE);
        assert_eq(fragment.at(0), MAX_FIELD_VALUE);

        fragment = fragment.subfragment(1, 3);
        assert_eq(fragment.at(0), 2);

        let data: [Field; 3] = fragment.to_array();
        assert_eq(data, [2, 3, 4]);
    }
}
