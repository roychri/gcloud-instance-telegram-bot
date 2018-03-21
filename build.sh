#!/bin/bash

VERSION=$(npm --silent run echo-version)
if [[ ${VERSION} = "$(cat .last-version)" && "$1" != "--force" ]]; then
    echo "Did you up the version?"
else
    docker build -t roychri/gcloud-instance-tgbot:${VERSION} .
    docker push roychri/gcloud-instance-tgbot:${VERSION}
    echo -n $VERSION > .last-version
fi
