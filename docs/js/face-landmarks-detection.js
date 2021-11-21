/// State.

var model = null
var cbkOnFaceLandmarksDetected = null
var ckbOnOnFaceLandmarksReady = null
var imageCapture;

/// UI.

let GetBtnTakeSnapshot = () => $('#btn-take-snapshot')

let GetVideoSelf = () => $("#video-self")

let OnClickTakeSnapshot = () => {
    console.log("snapshot button clicked");
    imageCapture.grabFrame()
        .then(imageBitmap => {
            console.log(imageBitmap)
            Send({snapshot: new Blob([imageBitmap])})
        })
        .catch(error => console.log(error));
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

const VIDEO_SIZE = 500;

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