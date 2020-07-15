#!/usr/bin/env bash
SERVER_ROOT=/home/atburke2/meelreel
USERNAME=$1
REMOTE_HOST=web.illinois.edu

SCP_TARGET=${USERNAME}@${REMOTE_HOST}:${SERVER_ROOT}

scp -r sql ${SCP_TARGET}/sql
scp *.py ${SCP_TARGET}
scp requirements.txt ${SCP_TARGET}

# TODO: build frontend
# scp -r frontend/build ${SCP_TARGET}/www/meelreel

ssh ${USERNAME}@${REMOTE_HOST} "source /home/atburke2/virtualenv/meelreel/3.7/bin/activate && \
  cd /home/atburke2/meelreel && \
  pip install -r requirements.txt"
