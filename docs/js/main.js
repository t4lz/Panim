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
    PrintLog("Received '" + JSON.stringify(data) + "'")
}

let OnFaceLandmarksReady = () => {
    PrintLog("Facial landmarks ready")
}

let OnFaceLandmarksDetected = (landmarks) => {
    Send(landmarks)
    PopulatePositionBuffer(LandmarksToPositionArray(landmarks))
}

$(document).ready(() => {
    InitPeerToPeer(OnConnect, OnReceive)
    InitFaceLandmarksDetection(OnFaceLandmarksReady, OnFaceLandmarksDetected)
    $('#btn-send').click(OnClickSend)

    InitWebGLStuff()
})