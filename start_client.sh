#!/bin/sh

docker run --expose 9999 --network="disharmony_default" -v /Users/ode/Koulu/distributed_systems/disharmony/client/src:/usr/src/app/src client
