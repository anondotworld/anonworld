mod bounded_vec_from_array {
    use crate::misc::bounded_vecs::bounded_vec_from_array;
    use crate::misc::arrays::sub_array_equals_up_to_length;
    use crate::rlp::types::RlpFragment;

    #[test]
    fn success() {
        let arr = [1, 2, 3, 4, 5];
        let vec: BoundedVec <u8, 10> = bounded_vec_from_array(arr);
        assert_eq(vec.len, 5);
        assert_eq(vec.max_len(), 10);
        assert(sub_array_equals_up_to_length(arr, vec.storage(), 0, 5));
    }

    #[test]
    fn fragments() {
        let arr = [RlpFragment { offset: 1, length: 2, data_type: 0 }];
        let vec: BoundedVec <RlpFragment, 10> = bounded_vec_from_array(arr);
        assert_eq(vec.len, 1);
        assert_eq(vec.max_len(), 10);
        assert(sub_array_equals_up_to_length(arr, vec.storage(), 0, 1));
    }

    #[test(should_fail_with = "Array size exceeds bounded vector size")]
    fn fail() {
        let arr = [1, 2, 3, 4, 5];
        let _: BoundedVec <u8, 3> = bounded_vec_from_array(arr);
    }
}

mod bounded_vec_map {
    use crate::misc::bounded_vecs::{bounded_vec_from_array, bounded_vec_map};

    #[test]
    fn success() {
        let vec = bounded_vec_from_array([1, 2, 3]);
        let mapped = bounded_vec_map(vec, |x| x * x);
        assert_eq(mapped.len, 3);
        assert_eq(mapped.max_len(), 3);
        assert_eq(mapped.storage(), [1, 4, 9]);
    }
}
