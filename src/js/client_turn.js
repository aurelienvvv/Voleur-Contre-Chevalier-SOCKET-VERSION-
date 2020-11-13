// TURN
let positionPlayer = {};
let dataCells = {};

socket.on('playerPosition', position => {
    positionPlayer.pos = $(`[data-player=${position}]`);
    positionPlayer.playerDataX = positionPlayer.pos.data('x');
    positionPlayer.playerDataY = positionPlayer.pos.data('y');
});

socket.on('displayInfosPlayer', playerAttr => {
    $(`[data-player]`).removeClass('current-player');
    $(`.players-wrapper .player`).removeClass('active');
    $(`.players-wrapper .player.${playerAttr}`).addClass('active');
    $(`[data-player = ${playerAttr}]`).addClass('current-player');
    $(`body`).addClass(`${playerAttr}`);
});