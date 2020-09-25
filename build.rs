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

use std::env;
use std::fs;
use std::path::Path;
use std::process::Command;

fn main() {
    println!("cargo:rerun-if-changed=.git/HEAD");
    println!("cargo:rerun-if-changed=.git/index");

    let out_dir = env::var_os("CARGO_MANIFEST_DIR").unwrap();
    let in_path = Path::new(&out_dir).join("public/service-worker.js");
    let out_path = Path::new(&out_dir).join("public/service-worker.build.js");
    let hash_path = Path::new(&out_dir).join("templates/commithash.html");

    let out = Command::new("git")
        .args(&["rev-parse", "HEAD"])
        .current_dir(out_dir)
        .output()
        .expect("failed to get last git commit hash");
    let hash = String::from_utf8(out.stdout).unwrap();
    let hash = &hash[..8];

    let content = fs::read_to_string(in_path).expect("unable to open service-worker.js");
    let content = content.replace("{{last_commit_hash}}", &hash);

    fs::write(out_path, content).expect("unable to write to service-worker.build.js");
    fs::write(hash_path, hash).expect("unable to write to templates/commithash.html");
}
