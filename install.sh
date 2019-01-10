#!/bin/bash

shopt -s nullglob
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ln -sf $DIR/index.js $HOME/bin/nest
echo "Installed!"
