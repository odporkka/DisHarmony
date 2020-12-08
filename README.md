# DisHarmony - Distributed Music Playlist App

Course project for Distributed Systems course fall 2020.

### Usage (Dev)
Monitor should be started with docker-composer so that
it makes a default network for app. This build monitor image.

Client image should first be built manually. After this clients 
can be started with sh script at root. You must give port number 
as an argument which is then exposed to the host. Port can 
be accessed for example with broswer to query the client state.

1. At project root. Build and start monitor: `docker-compose up`
2. Build client: `docker build -t client ./client`
3. Start nodes `./start_client.sh 3001`, `./start_client.sh 3002` etc.
    - Nodes crashing can be simulated with simply stopping node container
4. You can view every node state in browser
    - Monitor = `http://localhost:3000`
    - Nodes = `http://localhost:<port>`
5. You can add song suggestion with a client by posting JSON message 
   to the client. I.e. This works from host also.
   ```
    {
        "type": "NEW_SONG_REQUEST",
        "message": "Song 3"
    }
    ```
6. Logs for the monitor and each client can be seen in terminal.

### Client
App for clients/users. Entrypoint is at src/client.js.
New songs can be added by posting JSON to the client.

Lamport's logical clock is implemented in the lamportClock.js 
middleware class.

### Monitor
This is a simple http server for hosting and broadcasting client status.
Entry point is at src/server.js.

You can view monitor in dev at `http:localhost:3000`.