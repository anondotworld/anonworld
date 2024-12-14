mod empty {

    use crate::misc::fragment::Fragment;

    #[test]
    fn success_empty() {
        let fragment: Fragment<2, Field> = Fragment::empty();
        assert_eq(fragment.data, [0, 0]);
        assert_eq(fragment.offset, 0);
        assert_eq(fragment.length, 0);
    }
}

mod new {

    use crate::misc::fragment::Fragment;

    #[test]
    fn success_new() {
        let fragment = Fragment::new(1, 2, [1, 2, 3, 4]);
        assert_eq(fragment.data, [1, 2, 3, 4]);
        assert_eq(fragment.offset, 1);
        assert_eq(fragment.length, 2);
    }

    #[test(should_fail_with = "Fragment length exceeds data length")]
    fn fail_new_exceeding_length() {
        let _ = Fragment::new(3, 3, [1, 2, 3, 4]);
    }

    #[test]
    fn success_new_with_length() {
        let fragment = Fragment::new_with_length(2, [1, 2, 3, 4]);
        assert_eq(fragment.data, [1, 2, 3, 4]);
        assert_eq(fragment.offset, 0);
        assert_eq(fragment.length, 2);
    }

    #[test(should_fail_with = "Fragment length exceeds data length")]
    fn fail_new_with_length_exceeding_length() {
        let _ = Fragment::new_with_length(4, [1, 2, 3]);
    }

    #[test]
    fn success_from_array() {
        let fragment = Fragment::from_array([1, 2, 3, 4]);
        assert_eq(fragment.data, [1, 2, 3, 4]);
        assert_eq(fragment.offset, 0);
        assert_eq(fragment.length, 4);
    }
}

mod focus {

    use crate::misc::fragment::Fragment;

    #[test]
    fn success() {
        let fragment = Fragment::new(1, 2, [1, 2, 3, 4]);
        let focused_fragment = fragment.focus();
        assert_eq(focused_fragment.data, [2, 3]);
        assert_eq(focused_fragment.offset, 0);
        assert_eq(focused_fragment.length, 2);
    }

    #[test]
    fn success_full() {
        let fragment = Fragment::new(0, 4, [1, 2, 3, 4]);
        let focused_fragment = fragment.focus();
        assert_eq(focused_fragment.data, [1, 2, 3, 4]);
        assert_eq(focused_fragment.offset, 0);
        assert_eq(focused_fragment.length, 4);
    }

    #[test(should_fail_with = "New max length is smaller than fragment length")]
    fn fail() {
        let fragment = Fragment::new(1, 2, [1, 2, 3, 4]);
        let _: Fragment<1, u8> = fragment.focus();
    }
}

mod subfragment {

    use crate::misc::fragment::Fragment;

    #[test]
    fn simple() {
        let fragment = Fragment::from_array([1, 2, 3, 4]);
        let subfragment = fragment.subfragment(1, 2);
        assert(subfragment.at(0) == 2);
        assert(subfragment.at(1) == 3);
        assert(subfragment.offset == 1);
        assert(subfragment.length == 2);
    }

    #[test]
    fn simple_offset() {
        let fragment = Fragment::new(1, 4, [1, 2, 3, 4, 5]);
        let subfragment = fragment.subfragment(2, 2);
        assert(subfragment.at(0) == 4);
        assert(subfragment.at(1) == 5);
        assert(subfragment.offset == 3);
        assert(subfragment.length == 2);
    }

    #[test(should_fail_with="Subfragment overflows fragment")]
    fn fail() {
        let fragment = Fragment::new(1, 4, [1, 2, 3, 4, 5]);
        let _ = fragment.subfragment(2, 3);
    }
}

mod is_empty {

    use crate::misc::fragment::Fragment;

    #[test]
    fn zero_length() {
        let fragment = Fragment::new_with_length(0, [1, 2, 3]);
        assert(fragment.is_empty());
    }

    #[test]
    fn non_zero_length() {
        let fragment = Fragment::new_with_length(1, [1, 2, 3]);
        assert(!fragment.is_empty());
    }
}

mod at {

    use crate::misc::fragment::Fragment;

    #[test]
    fn success() {
        let fragment = Fragment::new(1, 2, [1, 2, 3]);
        assert(fragment.at(0) == 2);
        assert(fragment.at(1) == 3);
    }

    #[test(should_fail_with="Index out of bounds")]
    fn fail() {
        let fragment = Fragment::new(1, 2, [1, 2, 3]);
        let _ = fragment.at(2);
    }
}

mod set {

    use crate::misc::fragment::Fragment;

    #[test]
    fn success() {
        let mut fragment = Fragment::new(1, 2, [1, 2, 3]);
        fragment.set(0, 4);
        assert(fragment.at(0) == 4);
        assert(fragment.data == [1, 4, 3]);
    }

    #[test(should_fail_with="Index out of bounds, tried to set at index 2 but the length is 2")]
    fn fail() {
        let mut fragment = Fragment::new(1, 2, [1, 2, 3]);
        fragment.set(2, 4);
    }
}

mod pop_front {

    use crate::misc::fragment::Fragment;

    #[test]
    fn success() {
        let mut fragment = Fragment::new(1, 2, [1, 2, 3]);
        assert(fragment.pop_front() == 2);
        assert(fragment.pop_front() == 3);
        assert(fragment.length == 0);
    }

    #[test(should_fail_with="Cannot pop from an empty fragment")]
    fn fail() {
        let mut fragment = Fragment::new(1, 2, [1, 2, 3]);
        let _ = fragment.pop_front();
        let _ = fragment.pop_front();
        let _ = fragment.pop_front();
    }
}

mod pop_front_array {

    use crate::misc::fragment::Fragment;

    #[test]
    fn success() {
        let mut fragment = Fragment::new(1, 2, [1, 2, 3]);
        assert(fragment.pop_front_array() == [2, 3]);
        assert(fragment.length == 0);
    }

    #[test(should_fail_with="Cannot pop array: fragment is too short")]
    fn fail() {
        let mut fragment = Fragment::new(1, 1, [1, 2, 3]);
        assert(fragment.pop_front_array() == [2]);
        assert(fragment.pop_front_array() == [3]);
    }

    #[test(should_fail_with="Cannot pop array: fragment is too short")]
    fn partial_fail() {
        let mut fragment = Fragment::new(1, 1, [1, 2, 3]);
        assert(fragment.pop_front_array() == [2, 3]);
    }
}

mod pop_back {

    use crate::misc::fragment::Fragment;

    #[test]
    fn success() {
        let mut fragment = Fragment::new(1, 2, [1, 2, 3]);
        assert(fragment.pop_back() == 3);
        assert(fragment.pop_back() == 2);
        assert(fragment.length == 0);
    }

    #[test(should_fail_with="Cannot pop from an empty fragment")]
    fn fail() {
        let mut fragment = Fragment::new(1, 2, [1, 2, 3]);
        let _ = fragment.pop_back();
        let _ = fragment.pop_back();
        let _ = fragment.pop_back();
    }
}

mod push_back {

    use crate::misc::fragment::Fragment;

    #[test]
    fn success() {
        let mut fragment = Fragment::new(1, 1, [-1, 0, 1, 2]);
        assert(fragment.at(0) == 0);
        fragment.push_back(1);
        assert(fragment.at(1) == 1);
        fragment.push_back(2);
        assert(fragment.at(2) == 2);
        assert(fragment.length == 3);
    }

    #[test(should_fail_with="Cannot push: fragment is full")]
    fn fail() {
        let mut fragment = Fragment::new(1, 1, [0, 1, 0, 0]);
        fragment.push_back(2);
        fragment.push_back(3);
        fragment.push_back(4);
    }
}

mod extend_back {

    use crate::misc::fragment::Fragment;

    #[test]
    fn success() {
        let mut fragment = Fragment::new(0, 2, [1, 2, 0, 0]);
        fragment.extend_back([3, 4]);

        assert(fragment.offset == 0);
        assert(fragment.length == 4);
        assert(fragment.data == [1, 2, 3, 4]);
    }

    #[test(should_fail_with="Cannot push: fragment is full")]
    fn fail() {
        let mut fragment = Fragment::new(0, 2, [1, 2, 0, 0]);
        fragment.extend_back([3, 4, 5]);
    }
}

mod eq {

    use crate::misc::fragment::Fragment;

    #[test]
    fn empty() {
        let empty: Fragment<0, Field> = Fragment::empty();
        assert(empty.eq(empty));
    }

    #[test]
    fn same_size() {
        let f1 = Fragment::from_array([1, 2, 3]);
        let f2 = Fragment::from_array([1, 2, 4]);
        assert(f1.eq(f1));
        assert(!f1.eq(f2));
        assert(!f2.eq(f1));
    }

    #[test]
    fn different_length() {
        let f1 = Fragment::new_with_length(2, [1, 2, 3]);
        let f2 = Fragment::new_with_length(3, [1, 2, 3]);
        assert(!f1.eq(f2));
        assert(!f2.eq(f1));
    }

    #[test]
    fn different_size() {
        let f1 = Fragment::new_with_length(2, [1, 2, 3]);
        let f2 = Fragment::new_with_length(2, [1, 2, 3, 4]);
        assert(f1.eq(f2));
        assert(f2.eq(f1));
    }

    #[test]
    fn different_offset() {
        let f1 = Fragment::new(1, 2, [0, 1, 2, 3]);
        let f2 = Fragment::new(2, 2, [0, 0, 1, 2]);
        let f3 = Fragment::new(2, 2, [0, 1, 2, 3]);
        assert(f1.eq(f2));
        assert(f2.eq(f1));
        assert(!f1.eq(f3));
        assert(!f3.eq(f2));
    }
}

mod eq_trait {

    use crate::misc::fragment::Fragment;

    #[test]
    fn simple() {
        let fragment1 = Fragment::new(1, 2, [1, 2, 3]);
        let fragment2 = Fragment::new(1, 2, [1, 2, 3]);
        assert(fragment1 == fragment2);
    }

    #[test]
    fn different_offsets() {
        let fragment1 = Fragment::new(2, 3, [1, 1, 3, 4, 5, 1]);
        let fragment2 = Fragment::new(1, 3, [0, 3, 4, 5, 0, 0]);
        assert(fragment1 == fragment2);
    }

    #[test]
    fn not_equal() {
        let fragment1 = Fragment::new(2, 3, [0, 0, 3, 4, 5, 0]);
        let fragment2 = Fragment::new(1, 3, [0, 3, 4 + 1, 5, 0, 0]);
        assert(fragment1 != fragment2);
    }
}

mod to_array {

    use crate::misc::fragment::Fragment;

    #[test]
    fn simple() {
        let fragment = Fragment::new(1, 2, [1, 2, 3]);
        let array = fragment.to_array();
        assert(array == [2, 3]);
    }

    #[test]
    fn full() {
        let fragment = Fragment::new(0, 4, [1, 2, 3, 4]);
        let array = fragment.to_array();
        assert(array == [1, 2, 3, 4]);
    }
}

mod to_bounded_vec {
    use crate::misc::fragment::Fragment;

    #[test]
    fn simple() {
        let fragment = Fragment::new(1, 2, [1, 2, 3]);
        let bounded_vec: BoundedVec<Field, 2> = fragment.to_bounded_vec();
        let expected = BoundedVec::from_array([2, 3]);
        assert_eq(bounded_vec, expected);
    }

    #[test]
    fn full() {
        let fragment = Fragment::new(0, 4, [1, 2, 3, 4]);
        let bounded_vec: BoundedVec<Field, 4> = fragment.to_bounded_vec();
        let expected = BoundedVec::from_array([1, 2, 3, 4]);
        assert_eq(bounded_vec, expected);
    }

    #[test(should_fail_with="Fragment length exceeds BoundedVec max length")]
    fn bounded_vec_too_small() {
        let fragment = Fragment::new(0, 4, [1, 2, 3, 4]);
        let _: BoundedVec<Field, 3> = fragment.to_bounded_vec();
    }
}
