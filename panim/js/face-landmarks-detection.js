// adapted from https://raw.githubusercontent.com/tensorflow/tfjs-models/master/face-landmarks-detection/demo/index.js

function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
}

let videoWidth, videoHeight, video;

const VIDEO_SIZE = 500;
const mobile = isMobile();

// to avoid crowding limited screen space.
const state = {
    backend: 'webgl',
    maxFaces: 1,
    triangulateMesh: true,
    predictIrises: true
};

async function setupCamera() {
    video = document.getElementById('player');
    console.log(video);

    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            width: VIDEO_SIZE,
            height: VIDEO_SIZE
        },
    });
    console.log(stream);
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function doModelStuff() {
    // adapted from https://github.com/tensorflow/tfjs-models/blob/master/face-landmarks-detection/README.md#usage
    // Load the MediaPipe Facemesh package.
    console.log("dMS!")
    const model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh);

    // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain an
    // array of detected faces from the MediaPipe graph. If passing in a video
    // stream, a single prediction per frame will be returned.
    const predictions = await model.estimateFaces({
        input: document.querySelector("video")
    });

    if (predictions.length > 0) {
        /*
        `predictions` is an array of objects describing each detected face, for example:

        [
          {
            faceInViewConfidence: 1, // The probability of a face being present.
            boundingBox: { // The bounding box surrounding the face.
              topLeft: [232.28, 145.26],
              bottomRight: [449.75, 308.36],
            },
            mesh: [ // The 3D coordinates of each facial landmark.
              [92.07, 119.49, -17.54],
              [91.97, 102.52, -30.54],
              ...
            ],
            scaledMesh: [ // The 3D coordinates of each facial landmark, normalized.
              [322.32, 297.58, -17.54],
              [322.18, 263.95, -30.54]
            ],
            annotations: { // Semantic groupings of the `scaledMesh` coordinates.
              silhouette: [
                [326.19, 124.72, -3.82],
                [351.06, 126.30, -3.00],
                ...
              ],
              ...
            }
          }
        ]
        */


        for (let i = 0; i < predictions.length; i++) {
            const keypoints = predictions[i].scaledMesh;

            // Log facial keypoints.
            for (let i = 0; i < keypoints.length; i++) {
                const [x, y, z] = keypoints[i];

                console.log(`Keypoint ${i}: [${x}, ${y}, ${z}]`);
            }
        }
    }
    rafID = requestAnimationFrame(doModelStuff);
}

async function main() {
    await tf.setBackend(state.backend);
    await setupCamera();
    video.play();
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    video.width = videoWidth;
    video.height = videoHeight;

    await doModelStuff();
};

main();