const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use('/src', express.static('src'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

http.listen(PORT, () => {
    console.log('listening on *:3000');
});

const Data  = require("./src/js/Data");
const Utils  = require("./src/js/Utils");
const Turn  = require("./src/js/Turn");
const Game  = require("./src/js/Game");

const users = [];
const channels = [
    { name: "channel1" },
    { name: "channel2" },
    { name: "channel3" },
];


let game;

function addToChannel(channel, socket) {
    let currentUser = users.filter(user => user.id === socket.id)[0];
    currentUser.channel = channel;

    // Reconnait le nombre de joueurs sur le channel
    let usersOnChannels = users.filter(user => currentUser.channel === user.channel);

    // Mets à jour le nombre de joueurs sur les chaines
    for (channel of channels) {
        let numbOfUser = users.filter(u => u.channel === channel.name);
        channel.userOn = numbOfUser.length;
        socket.leave(channel.name);
    };

    io.emit('countUsersChannel', channels);

    return usersOnChannels;
};


io.on('connection', socket =>  {
    io.emit('countUsersChannel', channels);

    socket.on('clickCanGo', (dataCells) => {
        // au click sur une case '.can-go'
        let currentUser = users.filter(user => user.id === socket.id)[0];
        let channelUser = currentUser.channel;

        // met à jour la position du joueur sur la case
        game.turn.playerMoveUpdateDom(io, channelUser, dataCells, game);

        game.turn = new Turn(io, channelUser, socket);
        Data.fightTime = false;
    });

    socket.on('clickAttack', () => {
        let currentUser = users.filter(user => user.id === socket.id)[0];
        let channelUser = currentUser.channel;
        let currentPlayer = game.arrOfPlayers.filter(player => player.id === currentUser.id)[0];
        let enemy = game.arrOfPlayers.filter(player => currentPlayer.dataAttr !== player.dataAttr);

        game.turn.playerOnAttack(io, channelUser, enemy);
        game.turn.fightCondition(io, channelUser, currentPlayer, socket)
    })

    socket.on('dataWeaponsClient', (dataWeapons) => {
        // récupération des infos de l'arme du DOM
        let weapon = game.arrOfWeapons.filter(weapon => weapon.dataAttr === dataWeapons.cellWeapon);
        let currentUser = users.filter(user => user.id === socket.id)[0];
        let channelUser = currentUser.channel;
        
        game.turn.takeWeapon(io, channelUser, dataWeapons, weapon);
    }),

    socket.on('fightTimeDOM', (attrEnemy, positionEnemy) => {
        let currentUser = users.filter(user => user.id === socket.id)[0];
        let channelUser = currentUser.channel;
        let currentPlayerAttr = game.arrOfPlayers.filter(player => player.id === currentUser.id)[0].dataAttr;
        Data.fightTime = true;

        game.turn.enemyPosition(io, channelUser, attrEnemy, positionEnemy);
        socket.to(channelUser).emit('fightPlayerOptions', currentPlayerAttr);
    });

    socket.on('newUser', (name) => {
        users.push({ id: socket.id, name: name });
    });

    socket.on('newGame', (channel) => {
        let usersOnChannels = addToChannel(channel, socket);

        // Ajoute le joueur au channel
        socket.join(channel);
        let socketId = socket.id;

        if (usersOnChannels.length === 2) {
            // Envoie seulement à l'utilisateur
            io.to(socketId).emit('ioToSocketId', socketId);
    
            // Lance le jeu quand il y a 2 joueurs sur le channel
            game = new Game(io, channel, users, socket);
    
            io.in(channel).emit('ioInChannelTest');
    
            io.emit('countUsersChannel', channels);
            io.in(channel).emit('newGame', game);
        };
    });

    socket.on('disconnecting', () => {
        console.log('disconnecting')
        let currentUser = users.filter(user => user.id === socket.id)[0];

        if (currentUser) {
            // On récupère le channel du joueur en cours
            let usersOnChannels = users.filter(user => currentUser.channel === user.channel);
            let channelUser = currentUser.channel;

            // Déconnecte le joueur encore présent sur le channel
            io.to(channelUser).emit('disconnect channel');
            usersOnChannels.map(user => {user.channel = ''});

            // Retire le joueur qui quitte le jeu du tableau users
            users.splice(users.findIndex(user => user.id === socket.id),1);

            // Remet le nombre de joueurs du channel à 0
            let channelArray = channels.filter(c => c.name === channelUser)[0];
            if (channelArray) {
                channelArray.userOn = 0;
                io.emit('countUsersChannel', channels);
            };
        };
    });

    socket.on('disconnect', () => {
        console.log('disconnect');
        console.log(users);
    });
});
