module.exports = class Player {
    constructor(name, id, life, dataAttr, weapon, protect) {
        this.name = name;
        this.life = life;
        this.dataAttr = dataAttr;
        this.weapon = weapon;
        this.protect = protect;
        this.id = id;
    };

    
    updatePlayerDom(player, io, channel) {
        io.in(channel).emit('updatePlayerDom', player);
    };
};