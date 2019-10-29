macro_rules! load_hours {
    () => {
        match hours::full_load_hour().unwrap() {
            Some((base, hours)) => (base, hours),
            None => {
                return handlebars_response!(disable_minify "index", json!({
                    "no_hours": true,
                    "is_index": true,
                }));
            }
        };
    };
}

macro_rules! render_hour {
    ($base: ident, $kind: tt, $hours: ident, $matching: tt) => {
        for hour in &$hours {
            if hour.title.to_lowercase() == $matching.to_lowercase() {
                let html = hour.html(&$base).unwrap();

                return handlebars_response!(disable_minify "hour", json!({
                    "hour": hour,
                    "hour_html": html,
                    "path": format!("/{}/{}", $kind, hour.title),
                    "is_index": true,
                }));
            }
        }

        panic!("hour not found");
    };
}

macro_rules! load_render_hour {
    ($kind: ident, $path_kind: tt, $matching: tt) => {
        let (base, hours) = load_hours!();
        let $kind = hours.$kind;
        render_hour!(base, $path_kind, $kind, $matching);
    };
}
