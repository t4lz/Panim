const VIDEO_SIZE = 500;

let Assert = (condition, msg) => {
    if (!condition) throw msg
}

let OnClickSend = () => {
    Send("Hi!")
}

let PrintLog = (line) => {
    let prev = $("#log").html()
    $("#log").html(prev + line + "<br/>")
}

let OnConnect = (userId) => {
    PrintLog("Connected to " + userId)
}

let OnReceive = (data) => {
    PopulatePositionBuffer(data.positions)
}

let OnFaceLandmarksReady = () => {
    PrintLog("Facial landmarks ready")
}

let OnFaceLandmarksDetected = (landmarks) => {
    let data = {
        positions: LandmarksToPositionArray(landmarks),
    }
    Send(data)
}

$(document).ready(() => {
    InitPeerToPeer(OnConnect, OnReceive)
    InitFaceLandmarksDetection(OnFaceLandmarksReady, OnFaceLandmarksDetected)
    $('#btn-send').click(OnClickSend)

    InitWebGLStuff()
})