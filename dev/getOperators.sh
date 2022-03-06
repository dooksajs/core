#!/usr/bin/env bash
PATHTOJS=src
cut -s -d: -f1 $PATHTOJS/index.js |grep \'|tr '\n' \,|tr -d [:space:]|sed -e 's/\,$//'
