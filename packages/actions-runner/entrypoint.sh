#!/usr/bin/env bash
set -eEuo pipefail

TOKEN=$(curl -s -X POST -H "authorization: token ${TOKEN}" "https://api.github.com/repos/${OWNER}/${REPO}/actions/runners/registration-token" | jq -r .token)

cleanup() {
  ./config.sh remove --token "${TOKEN}"
}

./config.sh \
  --url "https://github.com/${OWNER}/${REPO}" \
  --token "${TOKEN}" \
  --name "${NAME}" \
  --unattended \
  --work _work

./runsvc.sh

cleanup
