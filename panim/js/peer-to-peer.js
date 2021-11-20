var peer = null
var conn = null

let RenderUrlToShare = (userId) => {
    let loc = window.location
    let url = loc.protocol + "//" + loc.host + loc.pathname + "?connect-to-peer=" + userId
    document.getElementById('url-to-share').innerHTML = url
}

let GetUrlParameters = () => {
    let params = new URLSearchParams(window.location.search);
    return {
        connectToPeer: params.get('connect-to-peer'),
    }
}

let CopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard')
    })
}

let OnClickUrlToShare = () => {
    CopyToClipboard(document.getElementById('url-to-share').innerHTML)
}

let OnClickSend = () => {
    if (conn) {
        conn.send("Hi!")
    }
}

let PrintLog = (line) => {
    document.getElementById('log').innerHTML += line + "<br/>"
}

let OnConnData = (data) => {
    PrintLog("Received '" + data + "'")
}

let OnPeerOpen = (userId) => {
    RenderUrlToShare(userId)

    // Immediately connect if we are given a peer to connect to.
    let params = GetUrlParameters()
    if (params.connectToPeer) {
        conn = peer.connect(params.connectToPeer);
        conn.on('data', OnConnData);
        PrintLog("Connected to '" + params.connectToPeer + "'")
    }
}

let OnPeerConnection = (c) => {

    // Allow only a single connection.
    if (conn && conn.open) {
        c.close()
        return
    }

    conn = c
    conn.on('data', OnConnData);
    PrintLog("Connected to '" + conn.peer + "'")
}

let InitPeerToPeer = () => {
    peer = new Peer()
    peer.on('open', OnPeerOpen)
    peer.on('connection', OnPeerConnection)
}