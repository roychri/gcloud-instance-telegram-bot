#!/bin/sh

gcloud auth activate-service-account $SERVICE_ACCOUNT_EMAIL \
       --key-file=$SERVICE_ACCOUNT_KEY_FILE

exec node index
