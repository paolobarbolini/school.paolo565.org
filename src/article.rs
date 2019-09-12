use crate::error::Result;
use serde::ser::{Serialize, SerializeStruct, Serializer};
use unhtml::FromHtml;
use url::Url;

pub fn load_article(id: i64) -> Result<Article> {
    let url = format!(
        "http://www.istitutogobetti.it/index.php?option=com_content&view=article&id={}",
        id
    );
    let text = reqwest::get(&url)?.text()?;

    let article = Article::from_html(&text)?;
    Ok(article)
}

#[derive(FromHtml, Clone, Debug)]
#[html(selector = "#jsn-mainbody")]
pub struct Article {
    #[html(selector = ".contentheading", attr = "inner")]
    title: String,

    #[html(selector = ".jsn-article-content p")]
    contents: Vec<ArticleContent>,
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
        let mut contents: Vec<ArticleUrl> = Vec::new();
        for c in &self.contents {
            if !c.urls.is_empty() {
                contents.extend_from_slice(c.urls.as_slice());
            }
        }

        contents
    }
}

impl Serialize for Article {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("Article", 3)?;
        s.serialize_field("title", &self.title)?;
        s.serialize_field("contents", &self.texts())?;
        s.serialize_field("urls", &self.urls())?;
        s.end()
    }
}

#[derive(FromHtml, Clone, Debug)]
pub struct ArticleContent {
    #[html(attr = "inner")]
    text: String,

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

impl Serialize for ArticleContent {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("ArticleContent", 2)?;
        s.serialize_field("text", &self.text)?;
        s.serialize_field("padding", &self.padding())?;
        s.end()
    }
}

#[derive(FromHtml, Clone, Debug)]
pub struct ArticleUrl {
    #[html(attr = "href")]
    href: String,

    #[html(attr = "inner")]
    text: String,
}

impl ArticleUrl {
    fn parsed_url(&self) -> url::Url {
        let parsed_url = Url::parse("http://www.istitutogobetti.it").unwrap();
        parsed_url.join(&self.href).unwrap()
    }

    pub fn abs_url(&self) -> String {
        self.parsed_url().into_string()
    }
}

impl Serialize for ArticleUrl {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut s = serializer.serialize_struct("ArticleUrl", 2)?;
        s.serialize_field("url", &self.abs_url())?;
        s.serialize_field("text", &self.text)?;
        s.end()
    }
}
