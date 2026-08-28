#!/bin/zsh
set -eu

project_dir=${0:A:h}
cd "$project_dir"

npm run dev -- --open --port 4173
