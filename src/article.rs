use crate::cache::{reqwest_data, reqwest_text};
use crate::error::Result;
use std::time::Duration;
use unhtml::FromHtml;
use url::Url;

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
    pub fn texts(&self) -> Vec<ArticleContent> {
        let mut contents: Vec<ArticleContent> = Vec::new();
        for c in self.contents.clone() {
            if c.urls.is_empty() {
                contents.push(c);
            }
        }

        contents
    }

    pub fn urls(&self) -> Vec<ArticleUrl> {
        let mut urls: Vec<ArticleUrl> = Vec::new();
        for c in &self.contents {
            if !c.text.is_empty() && !c.urls.is_empty() {
                urls.extend_from_slice(c.urls.as_slice());
            }
        }

        urls
    }

    pub fn hours_url(&self) -> Option<String> {
        let urls = self.urls();
        for u in urls {
            let url = u.href.to_lowercase();
            if url.starts_with("/weborario") || url.starts_with("/web_orario") {
                return Some(u.abs_url());
            }
        }

        None
    }

    pub fn pdfs(&self) -> Vec<ArticleUrl> {
        let mut u: Vec<ArticleUrl> = Vec::new();
        let urls = self.urls();
        for url in urls {
            if url.abs_url().ends_with(".pdf") {
                u.push(url);
            }
        }

        u
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
        match self.style.clone() {
            Some(style) => {
                let i = style.find("padding-left:");
                match i {
                    Some(i) => {
                        let padding = &style[i + "padding-left:".len()..];
                        let i = padding.find("px").unwrap();
                        let padding = &padding[..i];
                        let padding: String =
                            padding.chars().filter(|c| !c.is_whitespace()).collect();
                        padding.parse::<usize>().unwrap_or(0)
                    }
                    None => 0,
                }
            }
            None => 0,
        }
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

    pub async fn body(&self) -> Result<Vec<u8>> {
        let url = self.abs_url();
        let data = reqwest_data(url, Duration::from_secs(24 * 60 * 60))
            .await
            .unwrap();
        Ok(data)
    }
}
