// observe la position de déplacement pour récup des armes
function movePlayerWeaponsConditions() {
    if (dataCells.startPlayerDataY === dataCells.endPlayerDataY && dataCells.startPlayerDataX <= dataCells.endPlayerDataX) {
        let incrementAttribute = 'data-x';
        let staticAttribute = 'data-y';
        // $(`[data-player=${player.dataAttr}]`).removeClass('to-left');

        takeWeapon(dataCells.startPlayerDataX, dataCells.endPlayerDataX, dataCells.endPlayerDataY, incrementAttribute, staticAttribute);
    }

    // si le joueur se déplace de la droite vers la gauche
    else if (dataCells.startPlayerDataY === dataCells.endPlayerDataY && dataCells.startPlayerDataX >= dataCells.endPlayerDataX) {
        let incrementAttribute = 'data-x';
        let staticAttribute = 'data-y';

        // $(`[data-player=${player.dataAttr}]`).addClass('to-left');
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
