#[macro_use]
mod macros;

mod article;
mod articles;
mod cache;
mod error;
mod hour;
mod hours;
mod web;

#[tokio::main]
async fn main() {
    web::webserver().await;
}
