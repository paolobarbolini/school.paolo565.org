macro_rules! load_hours {
    () => {
        match hours::full_load_hour().await {
            Ok((base, hours)) => (base, hours),
            Err(err) if err.not_found() => {
                return Ok(askama_warp::reply(&IndexTemplate { hours: None }, "html"));
            }
            Err(err) => return Err(warp::reject::custom(err)),
        };
    };
}

macro_rules! render_hour {
    ($base: ident, $kind: tt, $hours: ident, $matching: tt) => {
        for hour in &$hours {
            if hour.title.to_lowercase() == $matching.to_lowercase() {
                let html = match hour.html(&$base).await {
                    Ok(html) => html,
                    Err(err) => return Err(warp::reject::custom(err)),
                };

                return Ok(askama_warp::reply(
                    &HourTemplate {
                        hour: hour.clone(),
                        hour_html: html,
                        path: format!("/{}/{}", $kind, hour.title),
                    },
                    "html",
                ));
            }
        }

        return Err(warp::reject::not_found());
    };
}

macro_rules! load_render_hour {
    ($kind: ident, $path_kind: tt, $matching: tt) => {
        let (base, hours) = load_hours!();
        let $kind = hours.$kind;
        render_hour!(base, $path_kind, $kind, $matching);
    };
}

macro_rules! try_status {
    ($result: expr) => {
        match $result {
            Ok(result) => result,
            Err(err) => return Err(warp::reject::custom(err)),
        }
    };
}
