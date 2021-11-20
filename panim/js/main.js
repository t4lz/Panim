window.addEventListener('load', () => {
    InitPeerToPeer()
    document.getElementById('url-to-share').addEventListener('click', OnClickUrlToShare)
    document.getElementById('btn-send').addEventListener('click', OnClickSend)
})