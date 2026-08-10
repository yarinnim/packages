#!/bin/bash

# From the commit message or merge request title, we need to study
# if the content is wrapped with `[` and `]` or not. If it's wrapped
# with tag, we need to make sure if the project folder really exists
# or not (project folder reflects the project name). If all the
# mention information matches, it will check if which branch
# is the commit in, so it will deploy the its evironment (`develop` or `test`).

function get_package() {
  echo "Validating commint against the package folder."
  export PACKAGE_NAME=$(echo "$CI_COMMIT_TITLE" | grep -o '\[.*\]' | sed 's/[][]//g')
  if [ -z "${PACKAGE_NAME}" ]; then
    PACKAGE_NAME=$(echo "$CI_COMMIT_DESCRIPTION" | grep -o '\[.*\]' | sed 's/[][]//g')
    if [ -z "${PACKAGE_NAME}" ]; then
      echo "[INFO] Application not mentioned (${PACKAGE_NAME})"
      echo "[INFO] Skipping next stage"
      exit 1
    fi
  fi

  export APP_ENV="development"
  if [ "${CI_COMMIT_BRANCH}" != "develop" ]; then
    APP_ENV="test"
  fi
}

# To make sure the built image information is passed to
# destination server (server which is use for deployment),
# we need to generate the information into the `build.env`
# file and ship it to the deployment server.
function generate_build_env() {
  echo "[INFO] Current Path: $(pwd)"
  # List files and directories in the current path
  echo "[INFO] Generating the build.env for built image information..."
  echo "PACKAGE_NAME=${PACKAGE_NAME}" > build.env
  echo "PACKAGE_ENV=${PACKAGE_ENV}" >> build.env
}

function show_env() {
  echo ""
  echo "==== CI/CD Env ===================="
  more build.env
  echo "==================================="
  echo ""
}

get_package
generate_build_env
show_env
