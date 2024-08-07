#!/bin/bash

export IMAGE_TAG=stable
export DATA_FOLDER=jass.ottersberg.ch
export PORT=8878
export IP_PREFIX=10.5.0
docker-compose --file ../docker-compose.yml --project-name $DATA_FOLDER $@
