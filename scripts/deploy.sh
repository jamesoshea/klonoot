#!/bin/bash
source .env

npm run test
npm run lint
npm run build
scp -r dist/* root@${SERVER_ADDRESS}:/var/www/klonoot.org/html