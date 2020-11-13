// INIT EVENT // EVENEMENT AU CLICK SUR UNE CASE
$('body').on('click', '.cells-container .cell.can-go', (e) => {
    let $obj = $(e.currentTarget);
    let $currentPlayer = $('.current-player');

    dataCells.startPlayerDataX = $currentPlayer.data('x');
    dataCells.startPlayerDataY = $currentPlayer.data('y');
    dataCells.endPlayerDataX = $obj.data('x');
    dataCells.endPlayerDataY = $obj.data('y');

    checkEnemyForFightAllDirections();
    
    socket.emit('clickCanGo', dataCells);
});

// maj du joueur qui vient de se déplacer
socket.on('playerMoveUpdateDom', (dataPlayer, cells, playersWeapon, fightTime) => {
    $(`.cell`).removeClass('can-go');
    $(`.cell`).removeClass('attack-enemy');
    $(`[data-player = ${dataPlayer}]`).removeClass(`player to-left`).removeAttr('data-player data-player-weapon').removeClass('current-player');
    $(`[data-x = ${cells.endPlayerDataX}][data-y = ${cells.endPlayerDataY}]`).attr('data-player', dataPlayer).addClass('player');

    // maj des armes des joueurs à chaque déplacement
    playersWeapon.forEach(player => {
        $(`[data-player = ${player.name}]`).attr('data-player-weapon', player.weapon);
    });

    movePlayerWeaponsConditions();

    // Fight Time
    if (fightTime) {
        let hasNotPlayer = $(".cell:not(.player)");

        hasNotPlayer.addClass('disapered');
        $('.fight-time-text').addClass('active');

        setTimeout(() => {
            hasNotPlayer.hide();
            $('.cells').addClass('-flex-cells');
        }, 1000);

        $('body').addClass('fight-time');
        $('.cell').removeClass('can-go');
        $('.cell').off('click');
    }

    $('.cell').off("click");
});

socket.on('selectPlayer', () => {
    $(`body`).removeClass(`player2`);
    $(`body`).removeClass(`player1`);
});
