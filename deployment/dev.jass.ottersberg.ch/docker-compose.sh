#!/bin/bash

export IMAGE_TAG=latest
export DATA_FOLDER=dev.jass.ottersberg.ch
export PORT=8879
export IP_PREFIX=10.6.0
docker-compose --file ../docker-compose.yml --project-name $DATA_FOLDER $@
