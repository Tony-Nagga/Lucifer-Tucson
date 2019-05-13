const Discord = require('discord.js');

exports.get = () => {
    let canremoverole = [
        "Discord Master",
        "Technical Support Discord",
        "Moderator",
        "Leaders",
        "Deputy Leaders",
    ];
    return canremoverole;
}
