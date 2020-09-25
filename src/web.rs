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

use std::convert::Infallible;

use askama::Template;
use rust_embed::RustEmbed;
use warp::http::header::{HeaderValue, CONTENT_TYPE};
use warp::http::StatusCode;
use warp::path::Tail;
use warp::reply::Response;
use warp::{Filter, Rejection, Reply};

use crate::article::{self, Article};
use crate::articles::{self, ArticleItem};
use crate::error::Error;
use crate::hour::{Hour, HourItem};
use crate::hours;

#[derive(RustEmbed)]
#[folder = "public/"]
struct Asset;

fn serve(path: &str) -> Result<impl Reply, Rejection> {
    let asset = Asset::get(path).ok_or_else(warp::reject::not_found)?;
    let mime = mime_guess::from_path(path).first_or_octet_stream();

    let mut res = Response::new(asset.into());
    res.headers_mut()
        .insert(CONTENT_TYPE, HeaderValue::from_str(mime.as_ref()).unwrap());
    Ok(res)
}

#[derive(Template)]
#[template(path = "index.html")]
struct IndexTemplate {
    hours: Option<Hour>,
}

#[derive(Template)]
#[template(path = "hour.html")]
struct HourTemplate {
    hour: HourItem,
    hour_html: String,
    path: String,
}

#[derive(Template)]
#[template(path = "articles.html")]
struct ArticlesTemplate {
    articles: Vec<ArticleItem>,
}

#[derive(Template)]
#[template(path = "article.html")]
struct ArticleTemplate {
    id: u64,
    article: Article,
    has_pdf: bool,
}

#[derive(Template)]
#[template(path = "about.html")]
struct AboutTemplate {}

#[derive(Template)]
#[template(path = "404.html")]
struct NotFoundTemplate {}

#[derive(Template)]
#[template(path = "500.html")]
struct InternalServerErrorTemplate {}

#[derive(Template)]
#[template(path = "offline.html")]
struct OfflineTemplate {}

async fn server_error(err: Rejection) -> Result<impl Reply, Infallible> {
    let not_found = if err.is_not_found() {
        true
    } else if let Some(err) = err.find::<Error>() {
        err.not_found()
    } else {
        false
    };

    if not_found {
        return Ok(warp::reply::with_status(
            askama_warp::reply(&NotFoundTemplate {}, "html"),
            StatusCode::NOT_FOUND,
        ));
    }

    Ok(warp::reply::with_status(
        askama_warp::reply(&InternalServerErrorTemplate {}, "html"),
        StatusCode::INTERNAL_SERVER_ERROR,
    ))
}

async fn offline() -> Result<impl Reply, Infallible> {
    Ok(OfflineTemplate {})
}

async fn index() -> Result<impl Reply, Rejection> {
    let (_, hours) = match hours::full_load_hour().await {
        Ok((base, hours)) => (base, hours),
        Err(err) if err.not_found() => return Ok(IndexTemplate { hours: None }),
        Err(err) => return Err(warp::reject::custom(err)),
    };

    Ok(IndexTemplate { hours: Some(hours) })
}

async fn classes(name: String) -> Result<impl Reply, Rejection> {
    load_render_hour!(classes, "classi", name);
}

async fn teachers(name: String) -> Result<impl Reply, Rejection> {
    load_render_hour!(teachers, "docenti", name);
}

async fn classrooms(name: String) -> Result<impl Reply, Rejection> {
    load_render_hour!(classrooms, "aule", name);
}

async fn articles() -> Result<impl Reply, Rejection> {
    let articles = articles::load_articles()
        .await
        .map_err(warp::reject::custom)?;

    Ok(ArticlesTemplate { articles })
}

async fn article(id: u64) -> Result<impl Reply, Rejection> {
    let article = article::load_article_id(id)
        .await
        .map_err(warp::reject::custom)?;
    let has_pdf = article.pdfs().count() == 1;

    Ok(ArticleTemplate {
        id,
        article,
        has_pdf,
    })
}

async fn pdf(id: u64, i: usize) -> Result<impl Reply, Rejection> {
    let article = article::load_article_id(id)
        .await
        .map_err(warp::reject::custom)?;
    let body = article
        .pdfs()
        .nth(i - 1)
        .ok_or_else(warp::reject::not_found)?
        .body()
        .await
        .map_err(warp::reject::custom)?;

    let mut res = Response::new(body.into());
    res.headers_mut()
        .insert(CONTENT_TYPE, HeaderValue::from_static("application/pdf"));
    Ok(res)
}

async fn about() -> Result<impl Reply, Infallible> {
    Ok(AboutTemplate {})
}

pub async fn webserver() {
    let index = warp::path::end().and_then(index);
    let classes = warp::path!("classi" / String).and_then(classes);
    let teachers = warp::path!("docenti" / String).and_then(teachers);
    let classrooms = warp::path!("aule" / String).and_then(classrooms);

    let articles = warp::path!("avvisi").and_then(articles);
    let article = warp::path!("avvisi" / u64).and_then(article);
    let pdf = warp::path!("avvisi" / u64 / "pdf" / usize).and_then(pdf);

    let about = warp::path!("info").and_then(about);

    async fn serve_static(tail: Tail) -> Result<impl Reply, Rejection> {
        serve(&format!("static/{}", tail.as_str()))
    }

    async fn serve_manifest() -> Result<impl Reply, Rejection> {
        serve("manifest.json")
    }

    async fn asset_sw() -> Result<impl Reply, Rejection> {
        serve("service-worker.build.js")
    }

    async fn asset_ico() -> Result<impl Reply, Rejection> {
        serve("favicon.ico")
    }

    let assets = warp::path("static")
        .and(warp::path::tail())
        .and_then(serve_static);
    let asset_manifest = warp::path!("manifest.json").and_then(serve_manifest);
    let asset_sw = warp::path!("service-worker.js").and_then(asset_sw);
    let asset_ico = warp::path!("favicon.ico").and_then(asset_ico);

    let offline = warp::path!("offline").and_then(offline);

    let routes = warp::get()
        .and(
            index
                .or(classes)
                .or(teachers)
                .or(classrooms)
                .or(articles)
                .or(article)
                .or(pdf)
                .or(about)
                .or(assets)
                .or(asset_manifest)
                .or(asset_sw)
                .or(asset_ico)
                .or(offline),
        )
        .recover(server_error);
    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}
