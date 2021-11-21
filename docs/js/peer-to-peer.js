/// State.

var peer = null
var conn = null
var cbkOnConnect = null
var cbkOnReceive = null
var peerAvatar = null;

// Manage connection, sending, and receiving.

let Send = (data) => {
    if (!conn || !conn.open) {
        return false
    }
    conn.send(data)
    if ('snapshot' in data) {
        console.log("sent snapshot!")
    }
    return true
}

let OnConnData = (data) => {
    console.log("Received '" + data + "'")
    if ('snapshot' in data) {
        console.log("got snapshot!")
        console.log(data.snapshot);
        SetNewTextureFromBlob(data.snapshot);
    }
    if ('coordinates' in data) {
        console.log(data.coordinates);
        PopulateTextureCoordBuffer(data.coordinates);
    }
    if (cbkOnReceive)
        cbkOnReceive(data)
}

let OnIncomingStream = (incomingStream) => {
    console.log("Playing incoming stream.")
        // `stream` is the MediaStream of the remote peer.
        // Here you'd add it to an HTML video/canvas element.
    const audio = document.createElement('audio');
    audio.style.display = "none";
    document.body.appendChild(audio);
    audio.srcObject = incomingStream;
    audio.play();
}


let setCall = () => {
    console.log("initiation call to " + conn.peer);
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(outgoingStream) {
        let call = peer.call(conn.peer, outgoingStream);
        call.on('stream', OnIncomingStream);
    });
}

let OnPeerOpen = (userId) => {
    UpdateUrlToShare(userId)

    // Immediately connect if we are given a peer to connect to.
    let params = new URLSearchParams(window.location.search);
    let connectToPeer = params.get('id')
    if (connectToPeer) {
        conn = peer.connect(connectToPeer);
        setCall(conn);
        conn.on('data', OnConnData);
        console.log("Connected to " + connectToPeer)
        SendMyAvatar();
        if (cbkOnConnect)
            cbkOnConnect(connectToPeer)
    }
}

let OnIncomingCall = (call) => {
    console.log("answering incoming call");
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(outgoingStream) {
        call.answer(outgoingStream);
    });
    call.on('stream', OnIncomingStream);
    SendMyAvatar();
}

let SendMyAvatar = () => {
    if (myAvatarBlob != null && myAvatarCoords != null) {
        console.log("sending my avatar to peer");
        Send({snapshot: myAvatarBlob, coordinates: myAvatarCoords});
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
    SendMyAvatar();
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
    let url = loc.protocol + "//" + loc.host + loc.pathname + "?id=" + userId
    $('#url-to-share').val(url)
}

let SetNewTextureFromBlob = (blob) => {
    peerAvatar = new Blob([blob]);
    // adapted from https://stackoverflow.com/a/27737668
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL(peerAvatar);
    PopulateTexture(imageUrl);
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
    peer.on('call', OnIncomingCall);


    // Init UI.
    GetBtnCopyUrlToShare().tooltip();
    GetBtnCopyUrlToShare().click(OnClickCopyUrlToShare)
    GetInpUrlToShare().click(OnClickUrlToShare)
    GetBtnCopyUrlToShare().bind('copied', OnCopiedCopyUrlToShare);
}