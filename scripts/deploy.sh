#!/bin/bash
source .env

npm run test
npm run lint

current_branch=$(git symbolic-ref --short head)

if [[ $current_branch = "main" ]]; then
    npm run build
    scp -r dist/* root@${SERVER_ADDRESS}:/var/www/klonoot.org/html
fi

if [[ $current_branch = "beta" ]]; then
    npm run build
    scp -r dist/* root@${SERVER_ADDRESS}:/var/www/beta.klonoot.org/html
fi

exit 0
