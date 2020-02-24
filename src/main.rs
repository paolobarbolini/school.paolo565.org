use std::borrow::Cow;
use std::convert::Infallible;

use askama::Template;
use rust_embed::RustEmbed;
use warp::http::header::HeaderValue;
use warp::http::Response;
use warp::hyper::Body;
use warp::path::Tail;
use warp::{Filter, Reply};

use self::article::Article;
use self::articles::ArticleItem;
use self::hour::{Hour, HourItem};

#[macro_use]
mod macros;

mod article;
mod articles;
mod cache;
mod error;
mod hour;
mod hours;

#[derive(RustEmbed)]
#[folder = "frontend/"]
struct Asset;

fn serve(path: &str) -> impl Reply {
    let mime = mime_guess::from_path(path).first_or_octet_stream();

    let asset: Option<Cow<'static, [u8]>> = Asset::get(path);

    //let file = asset.ok_or_else(warp::reject::not_found)?;
    let file = asset.unwrap(); // TODO: 404 handling
    let mut res = Response::new(Body::from(file));
    res.headers_mut().insert(
        "Content-Type",
        HeaderValue::from_str(&mime.to_string()).unwrap(),
    );
    res
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

async fn not_found() -> Result<impl Reply, Infallible> {
    Ok(NotFoundTemplate {})
}

async fn offline() -> Result<impl Reply, Infallible> {
    Ok(OfflineTemplate {})
}

async fn index() -> Result<impl Reply, Infallible> {
    let (_, hours) = match hours::full_load_hour().await {
        Ok((base, hours)) => (base, hours),
        Err(err) if err.not_found() => return Ok(IndexTemplate { hours: None }),
        Err(_) => unimplemented!("500 error"),
    };

    Ok(IndexTemplate { hours: Some(hours) })
}

async fn classes(name: String) -> Result<impl Reply, Infallible> {
    load_render_hour!(classes, "classi", name);
}

async fn teachers(name: String) -> Result<impl Reply, Infallible> {
    load_render_hour!(teachers, "docenti", name);
}

async fn classrooms(name: String) -> Result<impl Reply, Infallible> {
    load_render_hour!(classrooms, "aule", name);
}

async fn articles() -> Result<impl Reply, Infallible> {
    let articles = try_status!(articles::load_articles().await);

    Ok(ArticlesTemplate { articles })
}

async fn article(id: u64) -> Result<impl Reply, Infallible> {
    let article = article::load_article_id(id).await.unwrap();
    let pdfs = article.pdfs();

    Ok(ArticleTemplate {
        id,
        article,
        has_pdf: pdfs.len() == 1,
    })
}

async fn pdf(id: u64, i: usize) -> Result<impl Reply, Infallible> {
    let art = article::load_article_id(id).await.unwrap();
    let pdfs = art.pdfs();
    let body = pdfs[i - 1].body().await.unwrap();

    let mut res = Response::new(Body::from(body));
    res.headers_mut()
        .insert("Content-Type", HeaderValue::from_static("application/pdf"));
    Ok(res)
}

async fn about() -> Result<impl Reply, Infallible> {
    Ok(AboutTemplate {})
}

#[tokio::main]
async fn main() {
    let index = warp::path::end().and_then(index);
    let classes = warp::path!("classi" / String).and_then(classes);
    let teachers = warp::path!("docenti" / String).and_then(teachers);
    let classrooms = warp::path!("aule" / String).and_then(classrooms);

    let articles = warp::path!("avvisi").and_then(articles);
    let article = warp::path!("avvisi" / u64).and_then(article);
    let pdf = warp::path!("avvisi" / u64 / "pdf" / usize).and_then(pdf);

    let about = warp::path!("info").and_then(about);

    let assets = warp::path("static")
        .and(warp::path::tail())
        .map(|tail: Tail| serve(&format!("static/{}", tail.as_str())));
    let asset_manifest = warp::path!("manifest.json").map(|| serve("manifest.json"));
    let asset_sw = warp::path!("service-worker.js").map(|| serve("service-worker.build.js"));
    let asset_ico = warp::path!("favicon.ico").map(|| serve("favicon.ico"));

    let not_found = warp::any().and_then(not_found);
    let offline = warp::path!("offline").and_then(offline);
    // TODO: 500 page

    let routes = warp::get().and(
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
            .or(offline)
            .or(not_found),
    );
    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;
}
