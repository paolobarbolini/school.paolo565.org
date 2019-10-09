#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;

#[macro_use]
extern crate rocket_include_static_resources;

#[macro_use]
extern crate rocket_include_handlebars;

#[macro_use]
extern crate serde_json;

#[macro_use]
extern crate lazy_static;

use rocket::http::hyper::header::ETag;
use rocket::http::{ContentType, Status};
use rocket::{Request, Response};
use rocket_etag_if_none_match::{EntityTag, EtagIfNoneMatch};
use rocket_include_handlebars::HandlebarsResponse;
use rocket_include_static_resources::StaticResponse;
use std::collections::HashMap;
use std::io::Cursor;

#[macro_use]
mod macros;

mod article;
mod articles;
mod cache;
mod error;
mod hour;
mod hours;

#[catch(404)]
fn not_found(_req: &Request) -> HandlebarsResponse {
    let map: HashMap<String, String> = HashMap::new();
    handlebars_response!(disable_minify "404", &map)
}

#[catch(500)]
fn server_error(_req: &Request) -> HandlebarsResponse {
    let map: HashMap<String, String> = HashMap::new();
    handlebars_response!(disable_minify "500", &map)
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

#[get("/offline")]
fn offline() -> HandlebarsResponse {
    let map: HashMap<String, String> = HashMap::new();
    handlebars_response!(disable_minify "offline", &map)
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
fn index() -> HandlebarsResponse {
    let (_, hours) = load_hours!();

    let mut map = HashMap::new();
    map.insert("hours", json!(hours));
    map.insert("is_index", json!(true));
    handlebars_response!(disable_minify "index", &map)
}

#[get("/classi/<name>")]
fn classes(name: String) -> HandlebarsResponse {
    let (base, hours) = load_hours!();
    let classes = hours.classes;
    render_hour!(base, "classi", classes, name);
}

#[get("/docenti/<name>")]
fn teachers(name: String) -> HandlebarsResponse {
    let (base, hours) = load_hours!();
    let teachers = hours.teachers;
    render_hour!(base, "docenti", teachers, name);
}

#[get("/aule/<name>")]
fn classrooms(name: String) -> HandlebarsResponse {
    let (base, hours) = load_hours!();
    let classrooms = hours.classrooms;
    render_hour!(base, "aule", classrooms, name);
}

#[get("/avvisi")]
fn articles() -> HandlebarsResponse {
    let arts = articles::load_articles().unwrap();

    let mut map = HashMap::new();
    map.insert("articles", json!(arts));
    map.insert("is_articles", json!(true));
    handlebars_response!(disable_minify "articles", &map)
}

#[get("/avvisi/<id>")]
fn article(id: i64) -> HandlebarsResponse {
    let art = article::load_article_id(id).unwrap();
    let pdfs = art.pdfs();

    let mut map = HashMap::new();
    map.insert("article", json!(art));
    map.insert("path", json!(format!("/avvisi/{}", id)));
    map.insert("is_articles", json!(true));
    map.insert("has_pdf", json!(pdfs.len() == 1));
    handlebars_response!(disable_minify "article", &map)
}

#[get("/avvisi/<id>/pdf/<i>")]
fn pdf(etag: &EtagIfNoneMatch, id: i64, i: usize) -> Result<Response<'static>, Status> {
    let art = article::load_article_id(id).unwrap();
    let pdfs = art.pdfs();
    let body = pdfs[i - 1].body().unwrap();

    let digest = md5::compute(&body);
    let generated_etag = EntityTag::new(false, format!("{:x}", digest));
    if etag.strong_eq(&generated_etag) {
        Response::build().status(Status::NotModified).ok()
    } else {
        Response::build()
            .header(ETag(generated_etag))
            .header(ContentType::PDF)
            .sized_body(Cursor::new(body))
            .ok()
    }
}

#[get("/info")]
fn about() -> HandlebarsResponse {
    let mut map = HashMap::new();
    map.insert("is_about", json!(true));
    handlebars_response!(disable_minify "about", &map)
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
        .attach(HandlebarsResponse::fairing(|handlebars| {
            handlebars_resources_initialize!(
                handlebars,
                "index",
                "views/index.hbs",
                "hour",
                "views/hour.hbs",
                "article",
                "views/article.hbs",
                "articles",
                "views/articles.hbs",
                "about",
                "views/about.hbs",
                "header",
                "views/partials/header.hbs",
                "top_navigation",
                "views/partials/top_navigation.hbs",
                "article_item",
                "views/partials/article_item.hbs",
                "footer",
                "views/partials/footer.hbs",
                "commithash",
                "views/partials/commithash.hbs",
                "404",
                "views/404.hbs",
                "500",
                "views/500.hbs",
                "offline",
                "views/offline.hbs",
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
