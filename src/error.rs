use reqwest::StatusCode;
use std::error::Error as StdError;
use std::fmt;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Clone, Debug)]
pub enum Error {
    Reqwest { description: String },
    Unhtml { description: String },
    UrlNotFound,
    UnexpectedStatusCode { status: StatusCode },
}

impl Error {
    pub fn not_found(&self) -> bool {
        match &self {
            Error::Reqwest { .. } => false,
            Error::Unhtml { .. } => false,
            Error::UrlNotFound => true,
            Error::UnexpectedStatusCode { status } => {
                status == &StatusCode::NOT_FOUND || status == &StatusCode::GONE
            }
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Error::Reqwest { description } => write!(f, "{}", description),
            Error::Unhtml { description } => write!(f, "{}", description),
            Error::UrlNotFound => write!(f, "url not found"),
            Error::UnexpectedStatusCode { status } => {
                write!(f, "Unexpected status code: {}", status)
            }
        }
    }
}

impl StdError for Error {
    fn description(&self) -> &str {
        match self {
            Error::Reqwest { description } => &description,
            Error::Unhtml { description } => &description,
            Error::UrlNotFound => &"url not found",
            Error::UnexpectedStatusCode { .. } => &"unexpected status code",
        }
    }
}

impl From<reqwest::Error> for Error {
    fn from(err: reqwest::Error) -> Error {
        Error::Reqwest {
            description: err.description().to_owned(),
        }
    }
}

impl From<unhtml::Error> for Error {
    fn from(err: unhtml::Error) -> Error {
        Error::Unhtml {
            description: err.description().to_owned(),
        }
    }
}
