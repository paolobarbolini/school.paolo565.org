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

macro_rules! render_hour {
    ($base: ident, $kind: tt, $hour: ident) => {
        let html = $hour.html(&$base).unwrap();

        let mut map = HashMap::new();
        map.insert("hour", json!($hour));
        map.insert("hour_html", json!(html));
        map.insert("path", json!(format!("/{}/{}", $kind, $hour.title)));
        map.insert("is_index", json!(true));
        return handlebars_response!(disable_minify "hour", &map);
    };
}
