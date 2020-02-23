#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;

#[macro_use]
extern crate rocket_include_static_resources;

use askama::Template;
use rocket::http::{ContentType, Status};
use rocket::{Request, Response};
use rocket_include_static_resources::StaticResponse;
use std::io::Cursor;

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

#[catch(404)]
fn not_found(_req: &Request) -> NotFoundTemplate {
    NotFoundTemplate {}
}

#[catch(500)]
fn server_error(_req: &Request) -> InternalServerErrorTemplate {
    InternalServerErrorTemplate {}
}

#[get("/offline")]
fn offline() -> OfflineTemplate {
    OfflineTemplate {}
}

#[get("/manifest.json")]
fn manifest() -> StaticResponse {
    static_response!("manifest")
}

#[get("/service-worker.js")]
fn sw() -> StaticResponse {
    static_response!("sw")
}

#[get("/favicon.ico")]
fn favicon() -> StaticResponse {
    static_response!("favicon")
}

#[get("/static/app.css")]
fn css() -> StaticResponse {
    static_response!("css")
}

#[get("/static/app.print.css")]
fn css_print() -> StaticResponse {
    static_response!("css-print")
}

#[get("/static/app.js")]
fn js() -> StaticResponse {
    static_response!("js")
}

#[get("/static/vendored/pdf-js/pdf.js")]
fn pdf_js() -> StaticResponse {
    static_response!("pdf-js")
}

#[get("/static/vendored/pdf-js/pdf.worker.js")]
fn pdf_js_worker() -> StaticResponse {
    static_response!("pdf-js-worker")
}

#[get("/static/icon-192x192.png")]
fn icon_192() -> StaticResponse {
    static_response!("icon-192")
}

#[get("/static/icon-384x384.png")]
fn icon_384() -> StaticResponse {
    static_response!("icon-384")
}

#[get("/static/icon-512x512.png")]
fn icon_512() -> StaticResponse {
    static_response!("icon-512")
}

#[get("/")]
fn index() -> Result<IndexTemplate, Status> {
    let (_, hours) = match hours::full_load_hour() {
        Ok((base, hours)) => (base, hours),
        Err(err) if err.not_found() => {
            return Ok(IndexTemplate { hours: None });
        }
        Err(_) => return Err(Status::InternalServerError),
    };

    Ok(IndexTemplate { hours: Some(hours) })
}

#[get("/classi/<name>")]
fn classes<'r>(name: String) -> Result<Response<'r>, Status> {
    load_render_hour!(classes, "classi", name);
}

#[get("/docenti/<name>")]
fn teachers<'r>(name: String) -> Result<Response<'r>, Status> {
    load_render_hour!(teachers, "docenti", name);
}

#[get("/aule/<name>")]
fn classrooms<'r>(name: String) -> Result<Response<'r>, Status> {
    load_render_hour!(classrooms, "aule", name);
}

#[get("/avvisi")]
fn articles() -> Result<ArticlesTemplate, Status> {
    let articles = try_status!(articles::load_articles());

    Ok(ArticlesTemplate { articles })
}

#[get("/avvisi/<id>")]
fn article(id: u64) -> Result<ArticleTemplate, Status> {
    let article = article::load_article_id(id).unwrap();
    let pdfs = article.pdfs();

    Ok(ArticleTemplate {
        id,
        article,
        has_pdf: pdfs.len() == 1,
    })
}

#[get("/avvisi/<id>/pdf/<i>")]
fn pdf(id: u64, i: usize) -> Result<Response<'static>, Status> {
    let art = article::load_article_id(id).unwrap();
    let pdfs = art.pdfs();
    let body = pdfs[i - 1].body().unwrap();

    Response::build()
        .header(ContentType::PDF)
        .sized_body(Cursor::new(body))
        .ok()
}

#[get("/info")]
fn about() -> AboutTemplate {
    AboutTemplate {}
}

fn main() {
    rocket::ignite()
        .attach(StaticResponse::fairing(|resources| {
            static_resources_initialize!(
                resources,
                "favicon",
                "frontend/favicon.ico",
                "manifest",
                "frontend/manifest.json",
                "sw",
                "frontend/service-worker.build.js",
                "css",
                "frontend/static/app.css",
                "css-print",
                "frontend/static/app.print.css",
                "js",
                "frontend/static/app.js",
                "pdf-js",
                "frontend/static/vendored/pdf-js/pdf.js",
                "pdf-js-worker",
                "frontend/static/vendored/pdf-js/pdf.worker.js",
                "icon-192",
                "frontend/static/icon-192x192.png",
                "icon-384",
                "frontend/static/icon-384x384.png",
                "icon-512",
                "frontend/static/icon-512x512.png",
            );
        }))
        .mount(
            "/",
            routes![index, classes, teachers, classrooms, articles, article, pdf, about],
        )
        .mount(
            "/",
            routes![favicon, css, css_print, js, pdf_js, pdf_js_worker],
        )
        .mount(
            "/",
            routes![manifest, sw, offline, icon_192, icon_384, icon_512],
        )
        .register(catchers![not_found, server_error])
        .launch();
}
