#!/bin/sh
if [ ! $1 ]
then
  echo "You must pass port number as a first argument."
  echo "I.e. ./start_node.sh 3002"
else
  echo "Starting node in port $1"
  docker run --expose $1 -p $1:$1 -e PORT=$1 disharmony_node
fi
