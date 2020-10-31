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

use std::time::Duration;

use unhtml::scraper::{Html, Selector};
use unhtml::FromHtml;
use url::Url;

use crate::cache::reqwest_text;
use crate::error::Result;

pub async fn load_hour(url: String) -> Result<Hour> {
    let text = reqwest_text(url.clone(), Duration::from_secs(20 * 60)).await?;

    let mut urls = Hour::from_html(&text)?;
    urls.classes = url_to_abs(urls.classes, &url);
    urls.teachers = url_to_abs(urls.teachers, &url);
    urls.classrooms = url_to_abs(urls.classrooms, &url);
    Ok(urls)
}

fn url_to_abs(items: Vec<HourItem>, base: &str) -> Vec<HourItem> {
    let mut new_items = Vec::with_capacity(items.len());
    for u in items {
        let url = u.abs_url(base);
        new_items.push(HourItem {
            title: u.title,
            url,
        });
    }
    new_items
}

#[derive(FromHtml, Clone, Debug)]
#[html(selector = "center:nth-of-type(2) table")]
pub struct Hour {
    #[html(selector = "td:nth-of-type(1) a")]
    pub classes: Vec<HourItem>,

    #[html(selector = "td:nth-of-type(2) a")]
    pub teachers: Vec<HourItem>,

    #[html(selector = "td:nth-of-type(3) a")]
    pub classrooms: Vec<HourItem>,
}

#[derive(FromHtml, Clone, Debug)]
pub struct HourItem {
    #[html(attr = "inner")]
    pub title: String,

    #[html(attr = "href")]
    pub url: String,
}

impl HourItem {
    fn parsed_url(&self, base: &str) -> url::Url {
        let parsed_url = Url::parse(base).unwrap();
        parsed_url.join(&self.url).unwrap()
    }

    pub fn abs_url(&self, base: &str) -> String {
        self.parsed_url(base).into_string()
    }

    pub fn url_title(&self) -> String {
        self.title.replace("+", "").replace(" ", "+")
    }

    pub async fn html(&self, base: &str) -> Result<String> {
        let url = self.abs_url(base);
        let text = reqwest_text(url, Duration::from_secs(60 * 20))
            .await
            .unwrap();
        let fragment = Html::parse_document(&text);

        let table_selector = Selector::parse("center:nth-of-type(2)").unwrap();
        let mut table = fragment.select(&table_selector);
        let table = table.next().unwrap();

        // fix table hrefs
        let mut replacer = Vec::new();
        let a_selector = Selector::parse("a").unwrap();
        for a in table.select(&a_selector) {
            let href = a.value().attr("href");
            if let Some(original_href) = href {
                if !original_href.starts_with("../") || !original_href.ends_with(".html") {
                    continue;
                }

                let href = &original_href[3..original_href.len() - ".html".len()];
                let i = href.find('/').unwrap();
                let href = format!(
                    "/{}{}",
                    &href[..i].to_lowercase(),
                    &href[i..].replace("+", "").replace(" ", "+")
                );
                replacer.push((original_href, href));
            }
        }

        // TODO: is there a better way of updating the href?
        let mut html = table.inner_html();
        for replace in replacer {
            html = html.replace(&replace.0, &replace.1);
        }

        // hide empty table lines
        let line_selector = Selector::parse("tr").unwrap();
        let empty_line_selector = Selector::parse("td[bgcolor='#FFFFFF']").unwrap();

        let lines_count = table.select(&line_selector).count();
        let lines_iter = table
            .select(&line_selector)
            .map(|line| line.select(&empty_line_selector).count() >= 6);
        let empty_lines_iter = lines_iter
            .enumerate()
            .filter(|(_i, is_empty)| *is_empty)
            .map(|(i, _is_empty)| i);

        let mut last_non_empty_line = 1;
        for empty_line in empty_lines_iter {
            if (last_non_empty_line + 1) == empty_line {
                break;
            }

            last_non_empty_line = empty_line;
        }

        html += "<style>";
        for i in last_non_empty_line + 1..=lines_count {
            html += &format!("tr:nth-child({}), ", i);
        }
        html = html[..html.len() - 2].into();
        html += " { display: none; }";
        html += "</style>";

        html = html.replace("width=\"15%\"", "");
        html = html.replace("rowspan=\"1\"", "");
        html = html.replace("colspan=\"1\"", "");
        html = html.replace("cellspacing=\"4\"", "");
        html = html.replace("cellpadding=\"4\"", "");
        html = html.replace("cellspacing=\"0\"", "");
        html = html.replace("valign=\"MIDDLE\"", "");
        html = html.replace("border=\"2\"", "");
        html = html.replace("align=\"CENTER\"", "");
        html = html.replace("nowrap=\"\"", "");
        html = html.replace("width=\"80%\"", "");

        html = html.replace("id=\"mathema\"", "class=\"mathema-empty\"");
        html = html.replace("id=\"nodecBlack\"", "class=\"nodecBlack-inner\"");
        html = html.replace("id=\"nodecWhite\"", "class=\"nodecWhite-inner\"");

        Ok(html)
    }
}
