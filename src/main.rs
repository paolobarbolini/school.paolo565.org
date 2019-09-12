#![feature(proc_macro_hygiene, decl_macro)]

#[macro_use]
extern crate rocket;

#[macro_use]
extern crate rocket_include_static_resources;

#[macro_use]
extern crate rocket_include_handlebars;

use rocket_include_handlebars::HandlebarsResponse;
use rocket_include_static_resources::StaticResponse;
use std::collections::HashMap;

mod article;
mod articles;
mod error;

#[get("/manifest.json")]
fn manifest() -> StaticResponse {
    static_response!("manifest")
}

#[get("/favicon.ico")]
fn favicon() -> StaticResponse {
    static_response!("favicon")
}

#[get("/static/app.css")]
fn css() -> StaticResponse {
    static_response!("css")
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

#[get("/avvisi")]
fn articles() -> HandlebarsResponse {
    let arts = articles::load_articles().unwrap();

    let mut map = HashMap::new();
    map.insert("articles", arts);
    handlebars_response!(disable_minify "articles", &map)
}

#[get("/avvisi/<id>")]
fn article(id: i64) -> HandlebarsResponse {
    let art = article::load_article(id).unwrap();

    let mut map = HashMap::new();
    map.insert("article", art);
    handlebars_response!(disable_minify "article", &map)
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
                "css",
                "frontend/static/app.css",
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
                "article",
                "views/article.hbs",
                "articles",
                "views/articles.hbs",
                "header",
                "views/partials/header.hbs",
                "top_navigation",
                "views/partials/top_navigation.hbs",
                "article_item",
                "views/partials/article_item.hbs",
                "footer",
                "views/partials/footer.hbs",
            );
        }))
        .mount("/", routes![articles, article])
        .mount(
            "/",
            routes![favicon, manifest, css, icon_192, icon_384, icon_512],
        )
        .launch();
}
