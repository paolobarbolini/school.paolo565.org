use std::error::Error as StdError;
use std::fmt;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Clone, Debug)]
pub enum Error {
    Reqwest { description: String },
    Unhtml { description: String },
    UrlNotFound,
}

impl Error {
    pub fn not_found(&self) -> bool {
        match &self {
            Error::Reqwest { .. } => false,
            Error::Unhtml { .. } => false,
            Error::UrlNotFound => true,
        }
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Error::Reqwest { description } => write!(f, "{}", description),
            Error::Unhtml { description } => write!(f, "{}", description),
            Error::UrlNotFound => write!(f, "url not found"),
        }
    }
}

impl StdError for Error {}

impl From<reqwest::Error> for Error {
    fn from(err: reqwest::Error) -> Error {
        Error::Reqwest {
            description: err.to_string(),
        }
    }
}

impl From<unhtml::Error> for Error {
    fn from(err: unhtml::Error) -> Error {
        Error::Unhtml {
            description: err.to_string(),
        }
    }
}
