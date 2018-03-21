Simple Telegram Bot to control a single gcloud compute instance (a dev box for example).

This presumes that you have a [google cloud platform](https://cloud.google.com/) account and created a [google compute engine instance](https://cloud.google.com/compute/docs/instances/create-start-instance) that you want to control with this bot. It is also recommended that you create a [service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts) specifically for this with only the role `Compute Instance Admin (beta)` so it has limited access to your gcloud account.

This also presume that you already have a [telegram bot token](https://core.telegram.org/bots).

# How to build this app:

```
./build.sh
```

If you want to push in your own repo, edit this file to point to your own docker image repo.

## How to run with Docker:

You will need the following information to install it.

* Password (Generate a strong new password, the bot will ask you this password to make sure its you.)
* Instance Name and Zone (You will pick this name and zone when you create the instance)
* Telegram Bot Token (The botFather will give you this token)
* Project ID (This is the ID of your google cloud platform project)
* Service Account Email (You will get this when you will create the service account)
* Service Account Key (Make sure you specify JSON key when creating the service account. Save this in a file that you will need later)
* Docker, kubectl and/or helm installed, depending on how you want to install it.

```
docker run \
       --name mybot \
       -e DEBUG=*:error,*:debug \
       -e PASSWORD=secret \
       -e PORT=3000 \
       -e INSTANCE_NAME=instance-name \
       -e INSTANCE_ZONE=us-east1-f \
       -e BOT_TOKEN=634756457:HSSCV5GuHdfg5gDFgEDFg53FsdgdFhhfSDU \
       -e PROJECT_ID=myproject-456 \
       -e SERVICE_ACCOUNT_EMAIL=myserviceaccount@myproject-456.iam.gserviceaccount.com \
       -e SERVICE_ACCOUNT_KEY_FILE=/keys/gcloud-key.json \
       -v $(pwd)/gcloud-key.json:/keys/gcloud-key.json \
       roychri/gcloud-instance-tgbot:1.0.3
```

## How to deploy on Kubernetes:
```
kubectl create cm app-config \
        --from-literal=instance-name=instance-name \
        --from-literal=instance-zone=us-east1-f \
        --from-literal=project-id=myproject-456 \
        --from-literal=service-account-email=myserviceaccount@myproject-456.iam.gserviceaccount.com
kubectl create secret generic app-auth \
        --from-literal=password=secret
kubectl create secret generic telegram \
        --from-literal=token=634756457:HSSCV5GuHdfg5gDFgEDFg53FsdgdFhhfSDU
kubectl create secret generic gcloud-key \
        --from-file=google=gcloud-key.json
kubectl apply -f deploy.yaml
```

## How to create the helm package to install:

```
helm package deploy/gcloud-instance-telegram-bot
```

##Example on how to install that helm package:

```
helm install ./gcloud-instance-telegram-bot-1.0.0.tgz \
     --name my-dev-bot \
     --set telegram.token=634756457:HSSCV5GuHdfg5gDFgEDFg53FsdgdFhhfSDU \
     --set app.password=secret \
     --set gce.projectId=myproject-456 \
     --set gce.instance.name=instance-name \
     --set gce.instance.zone=us-east1-f \
     --set gce.serviceAccount.key="$(cat gcloud-key.json | base64 -w0)" \
     --set gce.serviceAccount.email="myserviceaccount@myproject-456.iam.gserviceaccount.com"
```


## Example on how to upgrade the helm package:

First, pull the new code

```
git pull
```

Second, rebuild the heml package
```
helm package deploy/gcloud-instance-telegram-bot
```

Third, upgrade the helm chart to the new version:

```
helm upgrade my-dev-bot ./gcloud-instance-telegram-bot-1.0.1.tgz \
     --set telegram.token=634756457:HSSCV5GuHdfg5gDFgEDFg53FsdgdFhhfSDU \
     --set app.password="secret" \
     --set gce.projectId=myproject-456 \
     --set gce.instance.name=instance-name \
     --set gce.instance.zone=us-east1-f \
     --set gce.serviceAccount.key="$(cat gcloud-key.json | base64 -w0)" \
     --set gce.serviceAccount.email="myserviceaccount@myproject-456.iam.gserviceaccount.com"
```

## TODO

* Better authentication, maybe by user id instead of shareable password
* Better logging, shows who's doing what and when.

