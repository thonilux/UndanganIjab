
function playAudio() {
    document.body.contains(document.getElementById("song")) ? document.getElementById("song").play() : document.body.contains(document.getElementById("AudioSC")) ? (SoundC(), jQuery("#mute-sound").show(), jQuery("#unmute-sound").hide()) : (!0, player.playVideo(), jQuery("#mute-sound").show(), jQuery("#unmute-sound").hide())
}
jQuery(document).ready(function (a) {
    function b() {
        document.body.contains(document.getElementById("song")) && (c ? document.getElementById("song").pause() : document.getElementById("song").play())
    }
    var c = window.settingAutoplay;
    document.body.contains(document.getElementById("song")) && (c ? (a("#mute-sound").show(), document.body.contains(document.getElementById("song"))) : a("#unmute-sound").show(), a("#audio-container").click(function () {
        c ? (a("#mute-sound").hide(), a("#unmute-sound").show(), b(), c = !1) : (a("#unmute-sound").hide(), a("#mute-sound").show(), b(), c = !0)
        let t = document.getElementById("song");

    }))
    document.addEventListener("visibilitychange", function () {
        let t = document.getElementById("song");
        if (document.hidden) {
            t.pause()
        }
        else {
            if (a("#mute-sound").is(":visible") && $("#btn_buka_undangan").length < 1) {
                t.play()
            }
        }
    });
});
function toggleAudio() {
    1 == player.getPlayerState() || 3 == player.getPlayerState() ? (player.pauseVideo(), jQuery("#mute-sound").hide(), jQuery("#unmute-sound").show()) : (player.playVideo(), jQuery("#mute-sound").show(), jQuery("#unmute-sound").hide())
}
document.body.contains(document.getElementById("AudioYT")) && (jQuery("#mute-sound").show(), jQuery("#unmute-sound").hide(), jQuery(document).on("click", "#audio-container", function () {
    toggleAudio()
}));
var h = document.querySelector("iframe#sc-widget"),
    b = h ? SC.Widget(h) : null,
    w = !1;
function SoundC() {
    b && SC.Widget.Events.READY && (w ? (b.pause(), w = !1) : (b.play(), w = !0)),
        !1 == w && (b.pause(), w = !1, jQuery("#mute-sound").hide(), jQuery("#unmute-sound").show()),
        !0 == w && (b.play(), w = !0, jQuery("#mute-sound").show(), jQuery("#unmute-sound").hide())
}
document.body.contains(document.getElementById("AudioSC")) && (jQuery("#mute-sound").show(), jQuery("#unmute-sound").hide(), jQuery(document).on("click", "#audio-container", function () {
    SoundC()
}));  