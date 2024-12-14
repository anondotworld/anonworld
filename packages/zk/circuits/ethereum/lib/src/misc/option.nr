pub fn make_option<T>(value: T, is_some: bool) -> Option<T> {
    if is_some == true {
        Option::some(value)
    } else {
        Option::none()
    }
}
