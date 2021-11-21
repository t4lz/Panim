/// State.

var model = null
var cbkOnFaceLandmarksDetected = null
var cbkOnFaceLandmarksReady = null
var imageCapture;

/// UI.

let GetBtnTakeSnapshot = () => $('#btn-take-snapshot')

let GetVideoSelf = () => $("#video-self")

let OnClickTakeSnapshot = () => {
    console.log("snapshot button clicked");
    imageCapture.grabFrame()
        .then(imageBitmap => {
            console.log(imageBitmap);
            return new Promise(res => {
                // create a canvas
                const canvas = document.createElement('canvas');
                // resize it to the size of our ImageBitmap
                canvas.width = imageBitmap.width;
                canvas.height = imageBitmap.height;
                // try to get a bitmaprenderer context
                let ctx = canvas.getContext('bitmaprenderer');
                if(ctx) {
                    // transfer the ImageBitmap to it
                    ctx.transferFromImageBitmap(imageBitmap);
                }
                else {
                    // in case someone supports createImageBitmap only
                    // twice in memory...
                    canvas.getContext('2d').drawImage(imageBitmap,0,0);
                }
                // get it back as a Blob
                return canvas.toBlob(res);
            });
        }).then(blob => {
        console.log('blob:');
        console.log(blob);
        Send({snapshot: blob});
    }).catch(error => console.log(error));
}


/// Main loop to predict facial landmarks.

let PredictFaceLandmarks = async() => {
    let landmarks = await model.estimateFaces({
        input: GetVideoSelf().get(0),
        returnTensors: false,
        flipHorizontal: false,
        predictIrises: true,
    });
    if (landmarks.length > 0 && cbkOnFaceLandmarksDetected)
        cbkOnFaceLandmarksDetected(landmarks)
    requestAnimationFrame(PredictFaceLandmarks);
}

/// Initialization.

let InitCamera = async() => {
    let domVideoSelf = GetVideoSelf().get(0)

    mediaStream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            width: VIDEO_SIZE,
            height: VIDEO_SIZE
        },
    });
    domVideoSelf.srcObject = mediaStream;
    const track = mediaStream.getVideoTracks()[0];
    imageCapture = new ImageCapture(track);
    return new Promise((resolve) => {
        domVideoSelf.onloadedmetadata = () => {
            domVideoSelf.play()
            resolve()
        }
    })
}

let InitModel = async() => {
    let package = faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    let config = {
        maxFaces: 1,
    }
    model = await faceLandmarksDetection.load(package, config)
}

let InitFaceLandmarksDetection = async(OnFaceLandmarksReady, OnFaceLandmarksDetected) => {
    cbkOnFaceLandmarksReady = OnFaceLandmarksReady
    cbkOnFaceLandmarksDetected = OnFaceLandmarksDetected
    GetBtnTakeSnapshot().click(OnClickTakeSnapshot);

    // Initialize asynchronously and wait for completion.
    let modelPromise = InitModel()
    let cameraPromise = InitCamera()
    await modelPromise
    await cameraPromise

    PredictFaceLandmarks()
}