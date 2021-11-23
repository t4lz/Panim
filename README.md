# [Panim](https://t4lz.github.io/Panim/) - Avatar based communication service
Winner project of the [Hackatum](https://hack.tum.de "Hackatum's Website") 2021 wild track.


## What is it?
Panim is a new form of communication. It is a lot more interactive than just a phone call, but not quite as intensive as a video call.
An avatar is used to represent you in the call. Your camera is used locally to detect your facial expressions and motion, but the video is not actually sent to your peers, just your face landmarks - 468 points that describe your current expression.

## How does it work?

#### Face Landmark Detection
We use [a pre-trained TensorFlow.js model](https://www.npmjs.com/package/@tensorflow-models/face-landmarks-detection "The model on npm").

#### Peer to Peer Communication
The peer to peer communication is done with [PeerJS](https://peerjs.com/), with connections borkered by _PeerServer Cloud_.
The audio is sent as is, but no video is sent, just the tensor of face landmarks.

#### Rendering the Avatar
We use `WebGL` to render the avatar. We bind the chosen avatar image as a texture to the face geometry.
