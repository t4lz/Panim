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
    PrintLog("Received '" + data + "'")
}


$(document).ready(() => {
    InitPeerToPeer(OnConnect, OnReceive)
    $('#btn-send').click(OnClickSend)
})