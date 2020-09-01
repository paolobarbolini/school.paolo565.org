use std::time::Duration;

use bytes::Bytes;
use unhtml::FromHtml;
use url::Url;

use crate::cache::{reqwest_data, reqwest_text};
use crate::error::Result;

pub async fn load_article_id(id: u64) -> Result<Article> {
    let url = format!(
        "http://www.istitutogobetti.it/index.php?option=com_content&view=article&id={}",
        id
    );
    load_article(url).await
}

pub async fn load_article(url: String) -> Result<Article> {
    let text = reqwest_text(url, Duration::from_secs(60 * 60)).await?;

    let article = Article::from_html(&text)?;
    Ok(article)
}

#[derive(FromHtml, Clone, Debug)]
#[html(selector = "#jsn-mainbody")]
pub struct Article {
    #[html(selector = ".contentheading", attr = "inner")]
    pub title: String,

    #[html(selector = ".jsn-article-content p")]
    pub contents: Vec<ArticleContent>,
}

impl Article {
    pub fn urls(&self) -> impl Iterator<Item = &ArticleUrl> {
        self.contents
            .iter()
            .filter(|c| !c.text.is_empty())
            .flat_map(|c| c.urls.iter())
    }

    // making askama happy
    pub fn urls_collected(&self) -> Vec<&ArticleUrl> {
        self.urls().collect()
    }

    pub fn hours_url(&self) -> Option<String> {
        self.urls()
            .find(|au| {
                let url = au.href.to_lowercase();
                url.starts_with("/weborario") || url.starts_with("/web_orario")
            })
            .map(|au| au.abs_url())
    }

    pub fn pdfs(&self) -> impl Iterator<Item = &ArticleUrl> {
        self.urls().filter(|url| url.abs_url().ends_with(".pdf"))
    }
}

#[derive(FromHtml, Clone, Debug)]
pub struct ArticleContent {
    #[html(attr = "inner")]
    pub text: String,

    #[html(attr = "style")]
    style: Option<String>,

    #[html(selector = "a")]
    urls: Vec<ArticleUrl>,
}

impl ArticleContent {
    pub fn padding(&self) -> usize {
        self.style
            .as_ref()
            .and_then(|style| {
                let padding = style.split("padding-left:").nth(1)?;
                let padding = padding.split("px").next()?;
                padding.trim().parse::<usize>().ok()
            })
            .unwrap_or(0)
    }
}

#[derive(FromHtml, Clone, Debug)]
pub struct ArticleUrl {
    #[html(attr = "href", default = "")]
    pub href: String,

    #[html(attr = "inner")]
    pub text: String,
}

impl ArticleUrl {
    fn parsed_url(&self) -> url::Url {
        let parsed_url = Url::parse("http://www.istitutogobetti.it").unwrap();
        parsed_url.join(&self.href).unwrap()
    }

    pub fn abs_url(&self) -> String {
        self.parsed_url().into_string()
    }

    pub async fn body(&self) -> Result<Bytes> {
        let url = self.abs_url();
        let data = reqwest_data(url, Duration::from_secs(24 * 60 * 60))
            .await
            .unwrap();
        Ok(data)
    }
}
