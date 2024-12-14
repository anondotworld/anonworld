mod memcpy_up_to_length {
    use crate::misc::arrays::memcpy_up_to_length;

    #[test]
    fn success() {
        let mut dest = [0; 3];
        let src = [1, 2, 3, 4, 5];
        memcpy_up_to_length(&mut dest, src, 2, 2);
        assert(dest == [3, 4, 0]);
    }

    #[test(should_fail_with = "Source index out of bound")]
    fn src_index_out_of_bound() {
        let mut dest = [0; 5];
        let src = [1, 2, 3];
        memcpy_up_to_length(&mut dest, src, 1, 3);
    }

    #[test(should_fail_with = "Destination index out of bound")]
    fn dest_index_out_of_bound() {
        let mut dest = [0; 3];
        let src = [1, 2, 3, 4, 5];
        memcpy_up_to_length(&mut dest, src, 1, 4);
    }
}

mod memcpy {
    use crate::misc::arrays::memcpy;

    #[test]
    fn success() {
        let mut dest = [0; 3];
        let src = [1, 2, 3, 4, 5];
        memcpy(&mut dest, src, 2);
        assert(dest == [3, 4, 5]);
    }

    #[test(should_fail_with = "Source index out of bound")]
    fn src_index_out_of_bound() {
        let mut dest = [0; 5];
        let src = [1, 2, 3];
        memcpy(&mut dest, src, 4);
    }
}

mod sub_array_equals_up_to_length {
    use crate::misc::arrays::sub_array_equals_up_to_length;

    #[test]
    fn success_small() {
        let value: [Field; 4] = [1, 2, 0, 0];
        let array: [Field; 6] = [42, 1, 2, 3, 4, 5];
        assert(sub_array_equals_up_to_length(value, array, 1, 2));
    }

    #[test]
    fn success_full_length() {
        let value: [Field; 4] = [1, 2, 0, 0];
        let array: [Field; 6] = [42, 1, 2, 0, 0, 5];
        assert(sub_array_equals_up_to_length(value, array, 1, 4));
    }

    #[test]
    fn success_big_subarray() {
        let subarray: [Field; 4] = [1, 2, 0, 0];
        let array: [Field; 5] = [0, 0, 1, 2, 0];
        assert(sub_array_equals_up_to_length(subarray, array, 2, 3));
    }

    #[test]
    fn success_big() {
        let subarray: [Field; 90] = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0
        ];
        let array: [Field; 100] = [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0
        ];
        assert(sub_array_equals_up_to_length(subarray, array, 20, 80));
    }

    #[test(should_fail_with = "Not equals")]
    fn full_length_not_equals() {
        let value: [Field; 4] = [1, 2, 0, 0];
        let array: [Field; 6] = [42, 1, 2, 3, 4, 5];
        assert(sub_array_equals_up_to_length(value, array, 1, 4), "Not equals");
    }

    #[test(should_fail_with = "Subarray index out of bound")]
    fn subarray_out_of_bound() {
        let value: [Field; 4] = [1, 2, 0, 0];
        let array: [Field; 6] = [42, 1, 2, 0, 0, 5];
        assert(sub_array_equals_up_to_length(value, array, 1, 5));
    }

    #[test(should_fail)] // Unfortunately in-loop index access happens before the assert
    fn array_out_of_bound() {
        let value: [Field; 5] = [1, 2, 0, 0, 5];
        let array: [Field; 5] = [42, 1, 2, 0, 0];
        assert(sub_array_equals_up_to_length(value, array, 1, 5));
    }
}

mod sub_array_equals {
    use crate::misc::arrays::sub_array_equals;
    #[test]
    fn success() {
        let sub_array: [Field; 3] = [2, 3, 4];
        let array: [Field; 5] = [1, 2, 3, 4, 5];
        assert(sub_array_equals(sub_array, array, 1));
        assert(!sub_array_equals(sub_array, array, 0));
        assert(!sub_array_equals(sub_array, array, 2));
        assert(!sub_array_equals(sub_array, array, 2));
    }

    #[test(should_fail_with = "Array index out of bound")]
    fn index_out_of_bound() -> bool {
        let sub_array: [Field; 3] = [2, 3, 4];
        let array: [Field; 5] = [1, 2, 3, 4, 5];
        sub_array_equals(sub_array, array, 3)
    }
}

mod resize {
    use crate::misc::arrays::resize;
    #[test]
    fn success() {
        assert_eq(resize([1, 2]), [1, 2, 0]);
        assert_eq(resize([1, 2]), [1, 2, 0, 0]);
        assert_eq(resize([1, 2]), [1, 2, 0, 0, 0]);
    }

    #[test]
    fn success_empty() {
        let expected: [Field; 0] = [];
        assert_eq(resize([]), expected);
    }

    #[test]
    fn success_2d() {
        let result: [[Field; 1]; 3] = resize([[1], [2]]);
        let expected_result = [[1], [2], [0]];
        for i in 0..3 {
            assert_eq(result[i], expected_result[i]);
        }
    }

    #[test(should_fail_with = "New length must be greater than or equal to old length")]
    fn new_length_is_shorter() {
        let _ : [Field; 1] = resize([1, 2]);
    }
}

mod subarray_inferred_len {
    use crate::misc::arrays::subarray_inferred_len;

    #[test]
    fn success() {
        let array = [1, 2, 3, 4, 5];
        assert_eq(subarray_inferred_len(array, 0), array);
        assert_eq(subarray_inferred_len(array, 1), []);
        assert_eq(subarray_inferred_len(array, 1), [2]);
        assert_eq(subarray_inferred_len(array, 1), [2, 3]);
        assert_eq(subarray_inferred_len(array, 1), [2, 3, 4]);
        assert_eq(subarray_inferred_len(array, 1), [2, 3, 4, 5]);
        assert_eq(subarray_inferred_len(array, 4), []);
        assert_eq(subarray_inferred_len(array, 4), [5]);
        assert_eq(subarray_inferred_len(array, 5), []);
    }

    #[test]
    fn success_empty_src() {
        let array: [Field; 0] = [];
        assert_eq(subarray_inferred_len(array, 0), []);
    }

    #[test]
    fn success_convert_bytes32_to_bytes20() {
        let array = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
        ];
        assert_eq(
            subarray_inferred_len(array, 12), [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
        );
    }

    #[test(should_fail_with = "Source index out of bound")]
    fn source_index_out_of_bound() {
        let array = [1, 2, 3, 4, 5];
        let _: [Field; 0] = subarray_inferred_len(array, 6);
    }
}
