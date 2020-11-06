// PLAYER 
socket.on('updatePlayerDom', player => {
    $(`.players-wrapper .${player.dataAttr} .wrapper-infos .name`).html(`${player.name}`);
    $(`.players-wrapper .${player.dataAttr} .wrapper-infos .life`).html(`<img src='src/img/heart.webp' class='heart-img' alt='vie'> ${player.life} %`);
    $(`.players-wrapper .${player.dataAttr} .wrapper-infos .weapon`).html(`Arme : ${player.weapon.name}`);


    if (!player.weapon.name) {
        $(`.${player.dataAttr} .wrapper-infos .weapon`).html(`Arme : Aucune`);
    };
});

// BOARD
socket.on('displayCells', cells => {
    console.log(cells)
    let containerCells = document.querySelector('.cells-container ul');

    for (let cell of cells) {
        if (cell.weapon) {
            containerCells.insertAdjacentHTML('beforeend', `<li class="cell weapon" data-weapon=${cell.weapon.dataAttr} data-x="${cell.x}" data-y="${cell.y}"></li>`);
        } else if (cell.player) {
            containerCells.insertAdjacentHTML('beforeend', `<li class="cell player ${cell.state}" data-player=${cell.player.dataAttr} data-x="${cell.x}" data-y="${cell.y}"></li>`);
        } else {
            containerCells.insertAdjacentHTML('beforeend', `<li class="cell ${cell.state}" data-x="${cell.x}" data-y="${cell.y}"></li>`);
        };
    };
});

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

// Affichage des cases can-go
socket.on('whereCanGo', () => {
    let dataXMin = positionPlayer.playerDataX - 3;
    let dataXMax = positionPlayer.playerDataX + 4;
    let dataYMin = positionPlayer.playerDataY - 3;
    let dataYMax = positionPlayer.playerDataY + 4;

    // donne accès aux cases, 3 cases en y, 3 cases en x
    $(`[data-x = ${positionPlayer.playerDataX}], [data-y = ${positionPlayer.playerDataY}]`).addClass('can-go');
    $(`[data-x = ${positionPlayer.playerDataX}][data-y = ${positionPlayer.playerDataY}]`).removeClass('can-go');
    $('.can-go.player').removeClass('can-go');

    loopCanGo(0, dataXMin, 'data-x');
    loopCanGo(dataXMax, 10, 'data-x');
    loopCanGo(0, dataYMin, 'data-y');
    loopCanGo(dataYMax, 11, 'data-y');
});

// Affichage des cases can-go
function loopCanGo(startLoop, endLoop, dataAttr) {
    // limites can-go à 3 cases en x et en y
    for (let i = startLoop; i < endLoop; i++) {
        $(`[${dataAttr} = ${i}]`).removeClass('can-go');
    };
};

// Affichage des cases can-go
socket.on('checkWalls', () => {
    // détecte les murs et empêche le joueur de passer à travers
    let wallsOnWay = $('.can-go.innacessible');

    wallsOnWay.each((index, elem) => {
        let dataWallX = $(elem).data('x');
        let dataWallY = $(elem).data('y');


        if (positionPlayer.playerDataX < dataWallX) {
            for (let i = dataWallX; i < 10; i++) {
                $(`[data-x = ${i}]`).removeClass('can-go');
            }
        }

        else if (positionPlayer.playerDataX > dataWallX) {
            for (let i = dataWallX; i > -1; i--) {
                $(`[data-x = ${i}]`).removeClass('can-go');
            }
        }

        else if (positionPlayer.playerDataY < dataWallY) {
            for (let i = dataWallY; i < 11; i++) {
                $(`[data-y = ${i}]`).removeClass('can-go');
            }
        }

        else if (positionPlayer.playerDataY > dataWallY) {
            for (let i = dataWallY; i > -1; i--) {
                $(`[data-y = ${i}]`).removeClass('can-go');
            }
        }
    })
});


$('body').on('click', '.cells-container .cell.can-go', (e) => {
    let $obj = $(e.currentTarget);
    let $currentPlayer = $('.current-player');

    dataCells.startPlayerDataX = $currentPlayer.data('x');
    dataCells.startPlayerDataY = $currentPlayer.data('y');
    dataCells.endPlayerDataX = $obj.data('x');
    dataCells.endPlayerDataY = $obj.data('y');

    movePlayerConditions();
    
    socket.emit('clickCanGo', dataCells);
});

// maj du joueur qui vient de se déplacer
socket.on('playerMoveUpdateDom', (dataPlayer, cells, playersWeapon) => {
    $(`.cell`).removeClass('can-go');
    $(`.cell`).removeClass('attack-enemy');
    $(`[data-player = ${dataPlayer}]`).removeClass(`player to-left`).removeAttr('data-player data-player-weapon').removeClass('current-player');
    $(`[data-x = ${cells.endPlayerDataX}][data-y = ${cells.endPlayerDataY}]`).attr('data-player', dataPlayer).addClass('player');

    // maj des armes des joueurs à chaque déplacement
    playersWeapon.forEach(player => {
        $(`[data-player = ${player.name}]`).attr('data-player-weapon', player.weapon);
    });

    $('.cell').off("click");
});

socket.on('selectPlayer', () => {
    $(`body`).removeClass(`player2`);
    $(`body`).removeClass(`player1`);
});

// observe la position de déplacement
function movePlayerConditions() {
    if (dataCells.startPlayerDataY === dataCells.endPlayerDataY && dataCells.startPlayerDataX <= dataCells.endPlayerDataX) {
        let incrementAttribute = 'data-x';
        let staticAttribute = 'data-y';
        // $(`[data-player=${this.player.dataAttr}]`).removeClass('to-left');

        takeWeapon(dataCells.startPlayerDataX, dataCells.endPlayerDataX, dataCells.endPlayerDataY, incrementAttribute, staticAttribute);
    }

    // si le joueur se déplace de la droite vers la gauche
    else if (dataCells.startPlayerDataY === dataCells.endPlayerDataY && dataCells.startPlayerDataX >= dataCells.endPlayerDataX) {
        let incrementAttribute = 'data-x';
        let staticAttribute = 'data-y';

        // $(`[data-player=${this.player.dataAttr}]`).addClass('to-left');
        takeWeapon(dataCells.endPlayerDataX, dataCells.startPlayerDataX, dataCells.endPlayerDataY, incrementAttribute, staticAttribute);
    }

    // si le joueur se déplace de haut en bas
    else if (dataCells.startPlayerDataX === dataCells.endPlayerDataX && dataCells.startPlayerDataY <= dataCells.endPlayerDataY) {
        let incrementAttribute = 'data-y';
        let staticAttribute = 'data-x';

        takeWeapon(dataCells.startPlayerDataY, dataCells.endPlayerDataY, dataCells.endPlayerDataX, incrementAttribute, staticAttribute);
    }

    // si le joueur se déplace de bas en haut
    else if (dataCells.startPlayerDataX === dataCells.endPlayerDataX && dataCells.startPlayerDataY >= dataCells.endPlayerDataY) {
        let incrementAttribute = 'data-y';
        let staticAttribute = 'data-x';

        takeWeapon(dataCells.endPlayerDataY, dataCells.startPlayerDataY, dataCells.endPlayerDataX, incrementAttribute, staticAttribute);
    };
};

// envoie info sur l'arme et sa position au serveur
function takeWeapon(startLoop, endLoop, staticDataYX, incrementAttribute, staticAttribute) {
    for (let i = startLoop; i <= endLoop; i++) {
        // récup de l'arme on envoie côté serveur
        let $currentCell = $(`[${incrementAttribute}=${i}][${staticAttribute}=${staticDataYX}]`);
        let cellWeapon = $currentCell.attr('data-weapon');
        let classWeaponPlayer = $currentCell.hasClass('weapon player');

        let currentCellData = {
            'incrementAttribute':incrementAttribute, 
            'i':i, 
            'staticAttribute':staticAttribute, 
            'staticDataYX':staticDataYX,
        }

        let dataWeapons = {
            'cellWeapon' : cellWeapon,
            'isWeaponPlayer' : classWeaponPlayer,
            'currentCell' : currentCellData,
            'dataCells' : dataCells
        }

        socket.emit('dataWeaponsClient', dataWeapons);
    };
};

// récupération des infos de l'arme du serveur
// affichage de l'arme dans le DOM
socket.on('sendWeaponClient', (canTakeWeapon, player, dataWeapons) => {
    let $currentCell = $(`[${dataWeapons.currentCell.incrementAttribute}=${dataWeapons.currentCell.i}][${dataWeapons.currentCell.staticAttribute}=${dataWeapons.currentCell.staticDataYX}]`);

    // quand un joueur passe sur une arme
    if (canTakeWeapon) { // -> donnée à récup en client
        if (player.weapon !== 'Aucune') {
            $currentCell.addClass('weapon');
            $currentCell.attr('data-weapon', player.weapon.dataAttr).removeClass('vide');
        } else {
            $currentCell.removeAttr('data-weapon').removeClass('weapon').addClass('vide');
        }

        if (dataWeapons.cellWeapon !== 'undefined') {
            $(`[data-x = ${dataWeapons.dataCells.endPlayerDataX}][data-y = ${dataWeapons.dataCells.endPlayerDataY}]`).attr('data-player-weapon', dataWeapons.cellWeapon);
        };
    };
});












socket.on('socketTest', channel => {
    console.log('Tu es sur le channel socket' + channel);
});

socket.on('broadcastTest', () => {
    console.log('je suis le broadcast');
});

socket.on('channelSocketTest', ()=> {
    console.log('je suis le socket TO channel');
});

socket.on('ioInChannelTest', ()=> {
    console.log('ioInChannelTest Love');
});

socket.on('ioOFFFFChannelTest', ()=> {
    console.log('ioOFFFChannelTest OFF');
});

socket.on('ioToSocketId', socketId => {
    console.log('ioToSocketId '+ socketId + ' I Love You');
});