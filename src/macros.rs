macro_rules! load_hours {
    () => {
        match hours::full_load_hour() {
            Ok((base, hours)) => (base, hours),
            Err(err) if err.not_found() => {
                return handlebars_render!("index", json!({
                    "no_hours": true,
                    "is_index": true,
                }));
            },
            Err(_) => return Err(Status::InternalServerError),
        };
    };
}

macro_rules! render_hour {
    ($base: ident, $kind: tt, $hours: ident, $matching: tt) => {
        for hour in &$hours {
            if hour.title.to_lowercase() == $matching.to_lowercase() {
                let html = match hour.html(&$base){
                    Ok(html) => html,
                    Err(_) => return Err(Status::InternalServerError),
                };

                return handlebars_render!("hour", json!({
                    "hour": hour,
                    "hour_html": html,
                    "path": format!("/{}/{}", $kind, hour.title),
                    "is_index": true,
                }));
            }
        }

        return Err(Status::NotFound);
    };
}

macro_rules! load_render_hour {
    ($kind: ident, $path_kind: tt, $matching: tt) => {
        let (base, hours) = load_hours!();
        let $kind = hours.$kind;
        render_hour!(base, $path_kind, $kind, $matching);
    };
}

macro_rules! handlebars_render {
    ($name:expr, $data:expr) => {
        Ok(handlebars_response!(disable_minify $name, $data));
    };
}

macro_rules! try_status {
    ($result: expr) => {
        match $result {
            Ok(result) => result,
            Err(err) if err.not_found() => return Err(Status::NotFound),
            Err(_) => return Err(Status::InternalServerError),
        }
    };
}
