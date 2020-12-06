#!/bin/sh
if [ ! $1 ]
then
  echo "You must pass port number as a first argument."
  echo "I.e. ./start_client.sh 3002"
else
  echo "Exposing client in host port $1"
  docker run --expose 9999 -p $1:9999 --network="disharmony_default" -v /Users/ode/Koulu/distributed_systems/disharmony/client/src:/usr/src/app/src client
fi
