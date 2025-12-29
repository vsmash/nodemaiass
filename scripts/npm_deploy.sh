#!/bin/bash
# get the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

git checkout main
git merge develop
git push

# check to see if npm user is logged in
npm whoami

# if not logged in, login
if [ $? -ne 0 ]; then
    npm login
fi
npm publish