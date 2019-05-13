const Discord = require('discord.js');

exports.send = async (bot, channel, message, webhook_name, time, avatar) => {
    if (!channel) return console.log('Канал не выбран.');
    if (!message) return console.log('Сообщение не указано.');
    if (!webhook_name) return console.log('ВебХук не найден.');
    if (!avatar) avatar = 'https://i.imgur.com/SReVrGM.png';
    channel.fetchWebhooks().then(webhook => {
        let foundHook = webhook.find(web => web.name == webhook_name)
        if (!foundHook){
            channel.createWebhook(webhook_name, avatar).then(webhook => {
                webhook.send(message, {
                    "username": webhook_name,
                    "avatarURL": avatar,
                }).then(msg => {
                    if (time) msg.delete(time);
                });
            });
        }else{
            foundHook.send(message, {
                "username": webhook_name,
                "avatarURL": avatar,
            }).then(msg => {
                if (time) msg.delete(time);
            });
        }
    });
}
