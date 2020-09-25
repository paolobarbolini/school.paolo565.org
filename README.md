# school.paolo565.org [![AGPL 3.0 License][licensebadge]](LICENSE) [![pipeline status][cibadge]][actions]
_A progressive web app which improves the interaction with my school's school hours page_

Try it here: [school.paolo565.org][website].

## Building
school.paolo565.org requires Rust 1.42 or later to build. The latest release can be installed via [rustup][rustup]

Once the Rust build environment is setup, the source code can be fetched using git:

    $ git clone https://github.com/paolobarbolini/school.paolo565.org.git

and then built using Cargo

    $ cargo build --release

The executable will be available at `target/release/school_paolo565_org`.

The webserver will bind to `127.0.0.1:3030`

## Third party dependencies

Files in `school.paolo565.org` are licensed under the Affero General Public License version 3,
the text of which can be found in COPYING.

Licensing of components:

* [PDF.js][pdfjs]: Apache 2.0
* [Font Awesome 5 SVG Icons][fa]: CC BY 4.0
* [Freepik][freepik] App Icon: CC BY 3.0

All unmodified files from these and other sources retain their original copyright
and license notices: see the relevant individual files.

[licensebadge]: https://img.shields.io/badge/license-AGPL%203-blue
[website]: https://school.paolo565.org
[pdfjs]: https://github.com/mozilla/pdf.js
[fa]: https://fontawesome.com/license/free
[freepik]: https://www.freepik.com
[actions]: https://github.com/paolobarbolini/school.paolo565.org/actions?query=workflow%3ACI
[cibadge]: https://github.com/paolobarbolini/school.paolo565.org/workflows/CI/badge.svg
[rustup]: https://rustup.rs
