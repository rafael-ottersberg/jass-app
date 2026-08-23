#! /usr/bin/env bash

export FLASK_APP=api

for i in $(seq 1 10); do
    if flask db upgrade; then
        exit 0
    fi
    echo "Database not ready yet, retrying in 3s... ($i/10)"
    sleep 3
done

echo "Could not apply database migrations after 10 attempts"
exit 1
