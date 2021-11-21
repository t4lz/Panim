# [Panim](https://t4lz.github.io/Panim/) - Avatar based communication service
This is developed as a part of [Hackatum](https://hack.tum.de "Hackatum's Website").


## What is it?
Panim is a new form of communication. It is a lot more interactive than just a phone call, but not quite as intensive as a video call.
An avatar is used to represent you in the call. Your camera is used locally to detect your facial expressions and motion, but the video is not actually sent to your peers, just your face landmarks - 468 points that describe your current expression.

## Motivation
Video calls bring some difficalty to many interactions, and we want to bridge those gaps, without giving up the more personal feeling of a video call.
But with this technology does not merely address the problems of video conferencing it also opens a whole new world of possibilities.

Depending on which avatar is used, various goals can be achieved:

#### Bandwidth
Using a photo of yourself, you can hold a call where all parties can see other talking, with a fraction of the bandwidth of a video call.
On large online events, like webinars or lectures, the audience can be present without overwhelming everybody's connection.

#### Eliminate Bias
In a setting where it is important to eliminate unconcious bias as much as possible like for example a job interview, the same avatar can just be used for all candidates, competely eliminating any unconciuos bias that might originate in appearance.

#### Privacy
Hold meetings from your unorgonized bedroom with the partner/children/cat walking in the background, and while everyone can see you talking, there is no danger of them ever getting a glimpse of your private home. Just use your favorite picture of yourself, and your colleagues allways see that version of you talking to them.

## How does it work?

#### Face Landmark Detection
We use [a pre-trained TensorFlow.js model](https://www.npmjs.com/package/@tensorflow-models/face-landmarks-detection "The model on npm").

#### Peer to Peer Communication
The peer to peer communication is done with [PeerJS](https://peerjs.com/), with connections borkered by _PeerServer Cloud_.
The audio is sent as is, but no video is sent, just the tensor of face landmarks.

#### Rendering the Avatar
We use `WebGL` to render the avatar. We bind the chosen avatar image as a texture to the face geometry.
