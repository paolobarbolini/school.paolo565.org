macro_rules! load_hours {
    () => {
        match hours::full_load_hour().unwrap() {
            Some((base, hours)) => (base, hours),
            None => {
                let mut map = HashMap::new();
                map.insert("no_hours", json!(true));
                map.insert("is_index", json!(true));
                return handlebars_response!(disable_minify "index", &map);
            }
        };
    };
}