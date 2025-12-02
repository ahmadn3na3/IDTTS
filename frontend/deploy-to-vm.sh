#!/bin/bash
set -e

echo "Pushing image to GitHub Container Registry..."
docker push ghcr.io/ahmadn3na3/idtts-frontend:latest

echo "Deploying to Google Cloud VM..."
gcloud compute ssh --zone "us-central1-a" "watcher-vm" --project "otracker-besmartech" --command "
echo 'Pulling latest image...'
docker pull ghcr.io/ahmadn3na3/idtts-frontend:latest

echo 'Stopping existing container...'
docker stop idtts-frontend || true
docker rm idtts-frontend || true

echo 'Starting new container...'
docker run -d --name idtts-frontend --restart always -p 80:80 ghcr.io/ahmadn3na3/idtts-frontend:latest
"

echo "Deployment complete!"
