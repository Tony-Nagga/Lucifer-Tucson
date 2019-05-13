const Discord = require('discord.js');

exports.getmod = () => {
    let moderators = [
        'Модератор',
        'Ст.Модератор'
    ];
    return moderators;
}

exports.getadmin = () => {
    let admins = [
        'Администратор',
        'Мл.Администратор'
    ];
    return admins;
}