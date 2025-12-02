#!/bin/bash
set -e

echo "Building Docker image locally..."
docker build -t idtts-frontend:latest .

echo "Saving and compressing image (this may take a moment)..."
docker save idtts-frontend:latest | gzip > idtts-frontend.tar.gz

echo "Transferring image to VM (watcher-vm)..."
gcloud compute scp idtts-frontend.tar.gz watcher-vm:~/idtts-frontend.tar.gz --zone "us-central1-a" --project "otracker-besmartech"

echo "Deploying on VM..."
gcloud compute ssh --zone "us-central1-a" "watcher-vm" --project "otracker-besmartech" --command "
    set -e
    echo 'Loading image from tarball...'
    docker load -i ~/idtts-frontend.tar.gz
    
    echo 'Stopping and removing existing container...'
    docker stop idtts-frontend || true
    docker rm idtts-frontend || true
    
    echo 'Starting new container...'
    docker run -d --name idtts-frontend --restart always -p 3000:80 idtts-frontend:latest
    
    echo 'Cleaning up remote files...'
    rm ~/idtts-frontend.tar.gz
"

echo "Cleaning up local files..."
rm idtts-frontend.tar.gz

echo "Deployment complete! The app should be live on the VM's IP."
