/// State.

var peer = null
var conn = null
var cbkOnConnect = null
var cbkOnReceive = null

// Manage connection, sending, and receiving.

let Send = (data) => {
    if (!conn || !conn.open)
        return false
    conn.send(data)
    return true
}

let OnConnData = (data) => {
    console.log("Received '" + data + "'")
    if (cbkOnReceive)
        cbkOnReceive(data)
}

let OnPeerOpen = (userId) => {
    UpdateUrlToShare(userId)

    // Immediately connect if we are given a peer to connect to.
    let params = new URLSearchParams(window.location.search);
    let connectToPeer = params.get('connect-to-peer')
    if (connectToPeer) {
        conn = peer.connect(connectToPeer);
        conn.on('data', OnConnData);
        console.log("Connected to " + connectToPeer)
        if (cbkOnConnect)
            cbkOnConnect(connectToPeer)
    }
}

let OnPeerConnection = (c) => {
    if (conn && conn.open) {
        c.close()
        return
    }
    conn = c
    conn.on('data', OnConnData);
    console.log("Connected to " + conn.peer)
    if (cbkOnConnect)
        cbkOnConnect(conn.peer)
}

/// UI.

let GetBtnCopyUrlToShare = () => $('#btn-copy-url-to-share')

let GetInpUrlToShare = () => $('#url-to-share')

let OnClickCopyUrlToShare = () => {
    navigator.clipboard.writeText(GetInpUrlToShare().val()).then(() => {
        GetBtnCopyUrlToShare().trigger('copied')
    })
}

let OnClickUrlToShare = () => {
    GetInpUrlToShare().select()
}

let OnCopiedCopyUrlToShare = () => {
    let originalText = GetBtnCopyUrlToShare().attr('data-bs-original-title')
    GetBtnCopyUrlToShare()
        .attr('data-bs-original-title', 'Copied!')
        .tooltip('show')
        .attr('data-bs-original-title', originalText)
}

let UpdateUrlToShare = (userId) => {
    let loc = window.location
    let url = loc.protocol + "//" + loc.host + loc.pathname + "?connect-to-peer=" + userId
    $('#url-to-share').val(url)
}

/// Initialization.

let InitPeerToPeer = (OnConnect, OnReceive) => {

    // Init callbacks.
    cbkOnConnect = OnConnect
    cbkOnReceive = OnReceive

    // Init PeerJS.
    peer = new Peer()
    peer.on('open', OnPeerOpen)
    peer.on('connection', OnPeerConnection)

    // Init UI.
    GetBtnCopyUrlToShare().tooltip();
    GetBtnCopyUrlToShare().click(OnClickCopyUrlToShare)
    GetInpUrlToShare().click(OnClickUrlToShare)
    GetBtnCopyUrlToShare().bind('copied', OnCopiedCopyUrlToShare);
}