#!/usr/bin/env bash
PATHTOJS=src
grep array.*\ \( $PATHTOJS/index.js |sed -e 's/^.*\(array[a-zA-Z0-9]*\)\ (.*$/\1/'