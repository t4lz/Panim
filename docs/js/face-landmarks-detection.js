/// State.

var model = null
var cbkOnFaceLandmarksDetected = null
var cbkOnFaceLandmarksReady = null
var imageCapture = null;
var myAvatarCanvas = null;
var myAvatarBlob = null;
var myAvatarCoords = null;
var hybridModeInterval = null;

/// UI.

let GetBtnTakeSnapshot = () => $('#btn-take-snapshot')

let GetVideoSelf = () => $("#video-self")

let GetHybridModeSwitch = () => $("#hybrid-mode-switch")

let OnHybridModeChange = (event) => {
    console.log("Hybrid mode: " + event.target.checked);
    if (event.target.checked) {
        OnStartHybridMode();
    } else {
        OnStopHybridMode();
    }
}

let OnStartHybridMode = () => {
    myHybridMode = true;
    SendStartHybrid();
    hybridModeInterval = window.setInterval(function(){
        OnClickTakeSnapshot();
    }, 1000);
}

let OnStopHybridMode = () => {
    myHybridMode = false;
    clearInterval(hybridModeInterval);
    SendStopHybrid();
}

let OnClickTakeSnapshot = () => {
    console.log("snapshot button clicked");
    imageCapture.grabFrame()
        .then(imageBitmap => {
            console.log(imageBitmap);
            // bitmap to blob creation adapted from: https://stackoverflow.com/a/52959897
            return new Promise(res => {
                myAvatarCanvas = document.createElement('canvas');
                myAvatarCanvas.width = imageBitmap.width;
                myAvatarCanvas.height = imageBitmap.height;
                let ctx = myAvatarCanvas.getContext('bitmaprenderer');
                if(ctx) {
                    ctx.transferFromImageBitmap(imageBitmap);
                }
                else {
                    myAvatarCanvas.getContext('2d').drawImage(imageBitmap,0,0);
                }
                myAvatarCanvas.toBlob(res);
            });
        }).then(async blob => {
        console.log('blob:');
        console.log(blob);
        let predictions = await model.estimateFaces({
            input: myAvatarCanvas,
            returnTensors: false,
            flipHorizontal: false,
            predictIrises: true,
        });
        console.log(predictions);
        if (predictions.length > 0) {
            var avatarCanvas = document.getElementById("canvas-my-avatar");
            var context = avatarCanvas.getContext('2d');
            context.drawImage(myAvatarCanvas, 0, 0, 100, 100); // draw also on small canvas for user to see.
            let landmarks = predictions[0].scaledMesh;
            myAvatarCoords = landmarks.map(point => [point[0] / myAvatarCanvas.width, point[1] / myAvatarCanvas.height]).flat();
            myAvatarBlob = blob;
            Send({snapshot: myAvatarBlob, coordinates: myAvatarCoords});
        } else {
            alert("Sorry, could not detect a face in the frame, please try again.");
        }
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
    GetHybridModeSwitch().click(OnHybridModeChange);

    // Initialize asynchronously and wait for completion.
    let modelPromise = InitModel()
    let cameraPromise = InitCamera()
    await modelPromise
    await cameraPromise

    PredictFaceLandmarks()
}