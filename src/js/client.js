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
