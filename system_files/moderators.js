const Discord = require('discord.js');

exports.getmod = () => {
    let moderators = [
        "Leaders",
        "Deputy Leaders",
    ];
    return moderators;
}

exports.getadmin = () => {
    let admins = [
        "Discord Master",
        "Technical Support Discord",
        "Moderator",
    ];
    return admins;
}
