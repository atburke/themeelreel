#!/usr/bin/env bash

cd frontend && \
npm run build && \
cd .. && \
rm -r app/static/* && \
cp -r frontend/build/static/* app/static && \
rm app/templates/* && \
cp frontend/build/* app/templates
