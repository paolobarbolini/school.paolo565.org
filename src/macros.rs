// school.paolo565.org
// Copyright (C) 2018-2020 Paolo Barbolini
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

macro_rules! load_hours {
    () => {
        match hours::full_load_hour().await {
            Ok((base, hours)) => (base, hours),
            Err(err) if err.not_found() => {
                return Ok(EitherReply::B(IndexTemplate { hours: None }));
            }
            Err(err) => return Err(warp::reject::custom(err)),
        };
    };
}

macro_rules! render_hour {
    ($base: ident, $kind: tt, $hours: ident, $matching: tt) => {
        let matching = $matching.to_lowercase().replace("+", " ");
        for hour in $hours {
            if hour.title.to_lowercase().replace("+", "") == matching {
                let html = match hour.html(&$base).await {
                    Ok(html) => html,
                    Err(err) => return Err(warp::reject::custom(err)),
                };

                let path = format!("/{}/{}", $kind, hour.title);
                return Ok(EitherReply::A(HourTemplate {
                    hour,
                    hour_html: html,
                    path,
                }));
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
