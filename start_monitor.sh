#!/bin/sh

docker run --expose 3000 -p 3000:3000 -v /Users/ode/Koulu/distributed_systems/disharmony/monitor/src:/usr/src/app/src monitor
