const Discord = require('discord.js'); 
const bot = new Discord.Client();

const nrpnames = new Set(); // Невалидные ники будут записаны в nrpnames
const sened = new Set(); // Уже отправленные запросы будут записаны в sened
const snyatie = new Set(); // Уже отправленные запросы на снятие роли быдут записаны в snyatie
const support_cooldown = new Set(); // Пользователи, которые создали обращение в поддержку Discord.

let serverid = [
    '438803520288981004', // Arizona Tucson
]

tags = require('./system_files/tags').get(); // При использовании tags['ТЭГ'] выводит роль.
let manytags = require('./system_files/manytags').get(); // При использовании manytags[0] выведет первый ТЭГ.
let rolesgg = require('./system_files/rolesgg').get(); // При использовании rolesgg[0] выведет первую роль.
let canremoverole = require('./system_files/canremoverole').get(); // При использовании canremoverole[0] выведет первую роль.
let canacceptremoverole = require('./system_files/canacceptremoverole').get(); // При использовании canacceptremoverole[0] выведет первую роль.
let webhook = require('./system_files/webhook'); // Вебхук
let moderators = require('./system_files/moderators').getmod(); // Модераторы
let admins = require('./system_files/moderators').getadmin(); // Администраторы
let re = /(\d+(\.\d)*)/i; // Проверка на циферки.
let global = {};
global.all = 0;
global.unwatched = 0;
global.hold = 0;
global.closed = 0;

async function get_support(){
    let testbot_server = bot.guilds.get(serverid[0]);
    let db_chan = testbot_server.channels.find(c => c.name == 'timer');
    let chandler_server = bot.guilds.get(serverid[1]);
    let support = chandler_server.channels.find(c => c.name == 'support');
    let rep_message;
    await db_chan.fetchMessages().then(async messages => {
        let db_msg = messages.find(m => m.content.startsWith(`MESSAGEID:`));
        if (db_msg){
            let id_mm = db_msg.content.match(re)[0]
            await support.fetchMessages().then(async messagestwo => {
                rep_message = await messagestwo.find(m => m.id == id_mm);
            });
        }
    });
    if (!rep_message){
        global.all = 0;
        global.unwatched = 0;
        global.hold = 0;
        global.closed = 0;
    }else{
        global.all = rep_message.content.split('\n')[3].match(re)[0];
        global.unwatched = rep_message.content.split('\n')[4].match(re)[0];
        global.hold = rep_message.content.split('\n')[5].match(re)[0];
        global.closed = rep_message.content.split('\n')[6].match(re)[0];
    }
}

function timer(){ 
    setInterval(() => { 
    let server = bot.guilds.get("438803520288981004"); 
    let channel = server.channels.find(c => c.name == "communication💬");
    channel.send("Уважаемые игроки сервера Tucson!");
    channel.send("Если вы хотите приобрести любые доступные привилегии, такие как **ключи к кейсу, Premium или роль семьи**, то вся информация находится в Канале #discord_покупки💲 .");
    channel.send("Приятной игры и времяпровождения на нашем Discord-сервере.");
    }, 1800000); // 1 секунда = 1000
}

const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

bot.login(process.env.token); // Авторизация бота
bot.on('ready', () => {
    console.log("Бот был успешно запущен!");
    bot.user.setActivity('за сервером', { type: 'WATCHING' }); // В активности будет: 'смотрит за сервером'
    bot.user.setPresence({ status: 'online' }); // Статус будет 'Не беспокоить', статусы: 'online', 'idle', 'dnd', 'invisible'
    timer();
    get_support();
});

bot.on('message', async message => {
    if (message.channel.type == "dm") return
    if (!serverid.some(id_of_server => id_of_server == message.guild.id)) return
    if (message.type === "PINS_ADD") if (message.channel.name == "requests-for-roles" || message.channel.name == "advertisement") message.delete();
    if (message.content == "Привет, Lucifer.") return message.reply("`привет! Рад тебя видеть.`") && console.log(`Поздаровался с ${message.member.displayName}.`)
    if (message.content == "Ладно, пока, Lucifer.") return message.reply("`до встречи! Не забывай заходить.`") && console.log(`Попращался с ${message.member.displayName}.`)
    if (message.author.id == bot.user.id) return
    
    if (message.content.startsWith(`/run`)){
        if (!['576812216310038559'].some(id_member => id_member == message.author.id)) return message.delete();
        const args = message.content.slice(`/run`).split(/ +/);
        let cmdrun = args.slice(1).join(" ");
        eval(cmdrun);
    }

    if (message.content.toLowerCase().includes('сними') || message.content.toLowerCase().includes('снять') || message.content.toLowerCase().includes('убери') || message.content.toLowerCase().includes('убрать')){
        if (!message.member.roles.some(r => canremoverole.includes(r.name)) && !message.member.hasPermission("MANAGE_ROLES")) return
        const args = message.content.split(/ +/);
        if (!['сними', 'снять', 'убрать', 'убери'].includes(args[0].toLowerCase())) return
        if (!['роль', 'роли'].includes(args[1].toLowerCase())) return
        if (!['у'].includes(args[2].toLowerCase())) return
        if (message.mentions.users.size > 1) return
        let user = message.guild.member(message.mentions.users.first());
        if (!user) return
        if (snyatie.has(message.author.id + `=>` + user.id)) return message.react(`🕖`);
        let reqchat = message.guild.channels.find(c => c.name == `requests-for-roles`);
        if (!reqchat){
            message.reply(`\`Ошибка выполнения. Канал requests-for-roles не был найден!\``)
            return console.error(`Канал requests-for-roles не был найден!`)
        }
        let roleremove = user.roles.find(r => rolesgg.includes(r.name));
        if (!roleremove){
            message.reply(`\`у пользователя нет фракционных ролей!\``).then(msg => msg.delete(9000));
            return message.delete();
        }

        message.reply(`\`напишите причину снятия роли.\``).then(answer => {
            message.channel.awaitMessages(response => response.member.id == message.member.id, {
                max: 1,
                time: 15000,
                errors: ['time'],
            }).then((collected) => {
                const embed = new Discord.RichEmbed()
                .setTitle("`Discord » Запрос о снятии роли.`")
                .setColor("#c21818")
                .addField("Отправитель", `\`Пользователь:\` <@${message.author.id}>`)
                .addField("Кому снять роль", `\`Пользователь:\` <@${user.id}>`)
                .addField("Роль для снятия", `\`Роль для снятия:\` <@&${roleremove.id}>`)
                .addField("Отправлено с канала", `<#${message.channel.id}>`)
                .addField("Причина снятия роли", `${collected.first().content}`)
                .addField("Информация", `\`[✔] - снять роль\`\n` + `\`[❌] - отказать в снятии роли\`\n` + `\`[D] - удалить сообщение\``)
                .setFooter("© for Tucson")
                .setTimestamp()
                reqchat.send(embed).then(async msgsen => {
                    answer.delete();
                    collected.first().delete();
                    await msgsen.react('✔')
                    await msgsen.react('❌')
                    await msgsen.react('🇩')
                    await msgsen.pin();
                })
                snyatie.add(message.author.id + `=>` + user.id);
                message.reply(`\`ваш запрос о снятии роли отправлен модераторам!\``).then(msg => msg.delete(12000));
                return message.delete();
            }).catch(() => {
                return answer.delete()
            });
        });
    } // Kory_McGregor

    if (message.content.toLowerCase().includes("роль") && !message.content.toLowerCase().includes(`сними`) && !message.content.toLowerCase().includes(`снять`)){
        if (nrpnames.has(message.member.displayName)){
            if (message.member.roles.some(r=>rolesgg.includes(r.name)) ) {
                for (var i in rolesgg){
                    let rolerem = bot.guilds.find(g => g.id == message.guild.id).roles.find(r => r.name == rolesgg[i]);
                    if (message.member.roles.some(role=>[rolesgg[i]].includes(role.name))){
                        await message.member.removeRole(rolerem);
                    }
                }
            }
            return message.react(`📛`);
        }
        // Проверить все доступные тэги
        for (var i in manytags){
            if (message.member.displayName.toLowerCase().includes("[" + manytags[i].toLowerCase()) || message.member.displayName.toLowerCase().includes(manytags[i].toLowerCase() + "]") || message.member.displayName.toLowerCase().includes("(" + manytags[i].toLowerCase()) || message.member.displayName.toLowerCase().includes(manytags[i].toLowerCase() + ")") || message.member.displayName.toLowerCase().includes("{" + manytags[i].toLowerCase()) || message.member.displayName.toLowerCase().includes(manytags[i].toLowerCase() + "}")){
                let rolename = tags[manytags[i].toUpperCase()] // Указать название роли по соответствию с тэгом
                let role = message.guild.roles.find(r => r.name == rolename); // Найти эту роль на discord сервере.
                let reqchat = message.guild.channels.find(c => c.name == `requests-for-roles`); // Найти чат на сервере.
                if (!role){
                    message.reply(`\`Ошибка выполнения. Роль ${rolename} не была найдена.\``)
                    return console.error(`Роль ${rolename} не найдена!`);
                }else if(!reqchat){
                    message.reply(`\`Ошибка выполнения. Канал requests-for-roles не был найден!\``)
                    return console.error(`Канал requests-for-roles не был найден!`)
                }
                if (message.member.roles.some(r => [rolename].includes(r.name))){
                    return message.react(`👌`) // Если роль есть, поставить окей.
                }
                let nickname = (message.member.displayName || message.member.user.username + message.member.user.tag);
                if (sened.has(nickname)) return message.react(`🕖`); // Если уже отправлял - поставить часы.
                const embed = new Discord.RichEmbed()
                .setTitle("`Discord » Проверка на валидность ник нейма.`")
                .setColor("#c21818")
                .addField("Аккаунт", `\`Пользователь:\` <@${message.author.id}>`, true)
                .addField("Никнейм", `\`Ник:\` ${nickname}`, true)
                .addField("Роль для выдачи", `\`Роль для выдачи:\` <@&${role.id}>`)
                .addField("Отправлено с канала", `<#${message.channel.id}>`)
                .addField("Информация по выдачи", `\`[✔] - выдать роль\`\n` + `\`[❌] - отказать в выдачи роли\`\n` + `\`[D] - удалить сообщение\``)
                .setFooter("© for Tucson")
                .setTimestamp();
                reqchat.send(embed).then(async msgsen => {
                    await msgsen.react('✔')
                    await msgsen.react('❌')
                    await msgsen.react('🇩')
                    await msgsen.pin();
                })
                sened.add(nickname); // Пометить данный ник, что он отправлял запрос.
                return message.react(`📨`);
            }
        }
    } // Kory_McGregor
});

/* Временно заброшено (Kory_McGregor)
bot.on('message', async (message) => {
    if (message.channel.type == 'dm') return
    if (message.author.id == bot.user.id) return
    if (!serverid.some(id => id == message.guild.id)) return

    if (message.channel.name == "support"){
        if (message.author.bot) return message.delete();
        if (support_cooldown.has(message.author.id)){
            return message.delete();
        }
        let mod_role = message.guild.roles.find(r => r.name == 'Модератор');
        if (!mod_role) return message.reply(`\`роль 'Модератор' не была найдена.\``).then(msg => msg.delete(12000));
        let s_category = message.guild.channels.find(c => c.name == "Активные жалобы");
        if (!s_category) return message.delete(3000);
        if (!message.member.hasPermission("ADMINISTRATOR")) support_cooldown.add(message.author.id);
        setTimeout(() => {
            if (support_cooldown.has(message.author.id)) support_cooldown.delete(message.author.id);
        }, 300000);
        let rep_message;
        let db_server = bot.guilds.find(g => g.id == serverid[0]);
        let db_channel = db_server.channels.find(c => c.name == "config");
        await db_channel.fetchMessages().then(async messages => {
            let db_msg = messages.find(m => m.content.startsWith(`MESSAGEID:`));
            if (db_msg){
                let id_mm = db_msg.content.match(re)[0]
                await message.channel.fetchMessages().then(async messagestwo => {
                    rep_message = await messagestwo.find(m => m.id == id_mm);
                });
            }
        });
        if (!rep_message){
            await message.channel.send(`` +
            `**Приветствую! Вы попали в канал поддержки сервера Chandler!**\n` +
            `**Тут Вы сможете задать вопрос модераторам или администраторам сервера!**\n\n` +
            `**Количество вопросов за все время: 0**\n` +
            `**Необработанных модераторами: 0**\n` +
            `**Вопросы на рассмотрении: 0**\n` +
            `**Закрытых: 0**`).then(async msg => {
                db_channel.send(`MESSAGEID: ${msg.id}`);
                rep_message = await message.channel.fetchMessage(msg.id);
                global.all = 0;
                global.unwatched = 0;
                global.hold = 0;
                global.closed = 0;
            });
        }
        global.all++;
        global.unwatched++;
        let onsys = global.all;
        let onsys2 = global.unwatched;
        await message.delete();
        await message.guild.createChannel(`ticket-${+onsys}`, "text", [{
            id: message.guild.id,
            deny: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'MENTION_EVERYONE', 'USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS'],},{
            id: message.author.id,
            deny: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'MENTION_EVERYONE'],
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS'],},{
            id: message.guild.roles.find(r => r.name == 'Модератор').id,
            deny: ['CREATE_INSTANT_INVITE', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'MENTION_EVERYONE'],
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS'],}
        ]).then(async channel => {
            await channel.setParent(s_category.id).then(async () => {
                channel.send(`<@${message.author.id}> \`для команды поддержки\` <@&${message.guild.roles.find(r => r.name == 'Модератор').id}>`, {embed: {
                color: 3447003,
                title: "Обращение к поддержке Discord",
                fields: [{
                    name: "Отправитель",
                    value: `**Пользователь:** <@${message.author.id}>`,
                },{
                    name: "Суть обращения",
                    value: `${message.content}`,
                }]
                }});
                message.channel.send(`<@${message.author.id}>, \`обращение составлено. Нажмите на\` <#${channel.id}>`).then(msg => msg.delete(15000));
                await rep_message.edit(`` +
                `**Приветствую! Вы попали в канал поддержки сервера Chandler!**\n` +
                `**Тут Вы сможете задать вопрос модераторам или администраторам сервера!**\n\n` +
                `**Количество вопросов за все время: ${+onsys}**\n` +
                `**Необработанных модераторами: ${+onsys2}**\n` +
                `**Вопросы на рассмотрении: ${global.hold}**\n` +
                `**Закрытых: ${global.closed}**`);
            }).catch(async () => {
                global.all--;
                global.unwatched--;
                await channel.delete();
            });
        });
    }
});
*/

bot.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return; // Если не будет добавление или удаление смайлика, то выход
    if (event.t == "MESSAGE_REACTION_ADD"){
        let event_guildid = event.d.guild_id // ID discord сервера
        let event_channelid = event.d.channel_id // ID канала
        let event_userid = event.d.user_id // ID того кто поставил смайлик
        let event_messageid = event.d.message_id // ID сообщение куда поставлен смайлик
        let event_emoji_name = event.d.emoji.name // Название смайлика

        if (event_userid == bot.user.id) return // Если поставил смайлик бот то выход
        if (!serverid.some(thisserv => event_guildid == thisserv)) return // Если сервер будет другой то выход

        let server = bot.guilds.find(g => g.id == event_guildid); // Получить сервер из его ID
        let channel = server.channels.find(c => c.id == event_channelid); // Получить канал на сервере по списку каналов
        let message = await channel.fetchMessage(event_messageid); // Получить сообщение из канала
        let member = server.members.find(m => m.id == event_userid); // Получить пользователя с сервера

        if (channel.name != `requests-for-roles`) return // Если название канала не будет 'requests-for-roles', то выйти

        if (event_emoji_name == "🇩"){
            if (!message.embeds[0]){
                channel.send(`\`[DELETED]\` ${member} \`удалил багнутый запрос.\``);
                return message.delete();
            }else if (message.embeds[0].title == "`Discord » Проверка на валидность ник нейма.`"){
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_nickname = message.embeds[0].fields[1].value.split(`\`Ник:\` `)[1];
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (!field_user || !field_nickname || !field_role || !field_channel){
                    channel.send(`\`[DELETED]\` ${member} \`удалил багнутый запрос.\``);
                }else{
                    channel.send(`\`[DELETED]\` ${member} \`удалил запрос от ${field_nickname}, с ID:\` || \`${field_user.id}\` ||`);
                }
                if (sened.has(field_nickname)) sened.delete(field_nickname); // Отметить ник, что он не отправлял запрос
                return message.delete();
            }else if (message.embeds[0].title == '`Discord » Запрос о снятии роли.`'){
                if (!member.roles.some(r => canacceptremoverole.includes(r.name))){
                    return channel.send(`\`[ERROR]\` ${member} \`недостаточно прав доступа.\``).then(msg => msg.delete(7000));
                }
                let field_author = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[1].value.split(/ +/)[1]);
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (!field_author || !field_user || !field_role || !field_channel){
                    channel.send(`\`[DELETED]\` ${member} \`удалил багнутый запрос на снятие роли.\``);
                }else{
                    channel.send(`\`[DELETED]\` ${member} \`удалил запрос на снятие роли от ${field_author.displayName}, с ID:\` || \`${field_author.id}\` ||`);
                }
                if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id)
                return message.delete();
            }
        }else if(event_emoji_name == "❌"){
            if (message.embeds[0].title == '`Discord » Проверка на валидность ник нейма.`'){
                if (message.reactions.size != 3){
                    return channel.send(`\`[ERROR]\` \`Не торопись! Сообщение еще загружается!\``)
                }
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_nickname = message.embeds[0].fields[1].value.split(`\`Ник:\` `)[1];
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                channel.send(`\`[DENY]\` <@${member.id}> \`отклонил запрос от ${field_nickname}, с ID:\` || \`${field_user.id}\` ||`);
                field_channel.send(`<@${field_user.id}>**,** \`модератор\` <@${member.id}> \`отклонил ваш запрос на выдачу роли.\nВы не сможете запрашивать роль, пока не поменяете имя.\``);
                nrpnames.add(field_nickname); // Добавить данный никнейм в список невалидных
                if (sened.has(field_nickname)) sened.delete(field_nickname); // Отметить ник, что он не отправлял запрос
                return message.delete();
            }else if (message.embeds[0].title == '`Discord » Запрос о снятии роли.`'){
                if (message.reactions.size != 3){
                    return channel.send(`\`[ERROR]\` \`Не торопись! Сообщение еще загружается!\``)
                }
                if (!member.roles.some(r => canacceptremoverole.includes(r.name))){
                    return channel.send(`\`[ERROR]\` ${member} \`недостаточно прав доступа.\``).then(msg => msg.delete(7000));
                }
                let field_author = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[1].value.split(/ +/)[1]);
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (!field_user.roles.some(r => r.id == field_role.id)){
                    if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id);
                    return message.delete();
                }
                channel.send(`\`[DENY]\` <@${member.id}> \`отклонил запрос на снятие роли от\` <@${field_author.id}>\`, с ID:\` || \`${field_author.id}\` ||`);
                field_channel.send(`<@${field_author.id}>**,** \`модератор\` <@${member.id}> \`отклонил ваш запрос на снятие роли пользователю:\` <@${field_user.id}>`)
                if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id);
                return message.delete();
            }
        }else if (event_emoji_name == "✔"){
            if (message.embeds[0].title == '`Discord » Проверка на валидность ник нейма.`'){
                if (message.reactions.size != 3){
                    // ERROR #8162153
                    /*
                        В случае данной ошибки удалите значение return.
                        Было:
                        if (message.reactions.size != 3){
                            return channel.send(`\`[ERROR]\` ${member} \`не торопись! Сообщение еще загружается!\nЕсли забагалось, попросите системного администратора ввести в поиск кода значение: 'ERROR #8162153'\``).then(msg => msg.delete(12000));
                        }
                        Должно стать:
                        if (message.reactions.size != 3){
                            channel.send(`\`[ERROR]\` ${member} \`не торопись! Сообщение еще загружается!\nЕсли забагалось, попросите системного администратора ввести в поиск кода значение: 'ERROR #8162153'\``).then(msg => msg.delete(12000));
                        }
                    */
                    return channel.send(`\`[ERROR]\` ${member} \`не торопись! Сообщение еще загружается!\nЕсли забагалось, попросите системного администратора ввести в поиск кода значение: 'ERROR #8162153'\``).then(msg => msg.delete(12000));
                }
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_nickname = message.embeds[0].fields[1].value.split(`\`Ник:\` `)[1];
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (field_user.roles.some(r => field_role.id == r.id)){
                    if (sened.has(field_nickname)) sened.delete(field_nickname); // Отметить ник, что он не отправлял запрос
                    return message.delete(); // Если роль есть, то выход
                }
                let rolesremoved = false;
                let rolesremovedcount = 0;
                if (field_user.roles.some(r=>rolesgg.includes(r.name))) {
                    for (var i in rolesgg){
                        let rolerem = server.roles.find(r => r.name == rolesgg[i]);
                        if (field_user.roles.some(role=>[rolesgg[i]].includes(role.name))){
                            rolesremoved = true;
                            rolesremovedcount = rolesremovedcount+1;
                            await field_user.removeRole(rolerem); // Забрать фракционные роли
                        }
                    }
                }
                await field_user.addRole(field_role); // Выдать роль по соответствию с тэгом
                channel.send(`\`[ACCEPT]\` <@${member.id}> \`одобрил запрос от ${field_nickname}, с ID:\` || \`${field_user.id}\` ||`);
                if (rolesremoved){
                    if (rolesremovedcount == 1){
                        field_channel.send(`<@${field_user.id}>**,** \`модератор\` <@${member.id}> \`одобрил ваш запрос на выдачу роли.\`\n\`Роль\`  <@&${field_role.id}>  \`была выдана! ${rolesremovedcount} роль другой фракции была убрана.\``)
                    }else if (rolesremovedcount < 5){
                        field_channel.send(`<@${field_user.id}>**,** \`модератор\` <@${member.id}> \`одобрил ваш запрос на выдачу роли.\`\n\`Роль\`  <@&${field_role.id}>  \`была выдана! Остальные ${rolesremovedcount} роли других фракций были убраны.\``)
                    }else{
                        field_channel.send(`<@${field_user.id}>**,** \`модератор\` <@${member.id}> \`одобрил ваш запрос на выдачу роли.\`\n\`Роль\`  <@&${field_role.id}>  \`была выдана! Остальные ${rolesremovedcount} ролей других фракций были убраны.\``)
                    }
                }else{
                    field_channel.send(`<@${field_user.id}>**,** \`модератор\` <@${member.id}> \`одобрил ваш запрос на выдачу роли.\`\n\`Роль\`  <@&${field_role.id}>  \`была выдана!\``)
                }
                if (sened.has(field_nickname)) sened.delete(field_nickname); // Отметить ник, что он не отправлял запрос
                return message.delete();
            }else if (message.embeds[0].title == '`Discord » Запрос о снятии роли.`'){
                if (message.reactions.size != 3){
                    // ERROR #7139625
                    /*
                        В случае данной ошибки удалите значение return.
                        Было:
                        if (message.reactions.size != 3){
                            return channel.send(`\`[ERROR]\` ${member} \`не торопись! Сообщение еще загружается!\nЕсли забагалось, попросите системного администратора ввести в поиск кода значение: 'ERROR #7139625'\``).then(msg => msg.delete(12000));
                        }
                        Должно стать:
                        if (message.reactions.size != 3){
                            channel.send(`\`[ERROR]\` ${member} \`не торопись! Сообщение еще загружается!\nЕсли забагалось, попросите системного администратора ввести в поиск кода значение: 'ERROR #7139625'\``).then(msg => msg.delete(12000));
                        }
                    */
                    return channel.send(`\`[ERROR]\` ${member} \`не торопись! Сообщение еще загружается!\nЕсли забагалось, попросите системного администратора ввести в поиск кода значение: 'ERROR #7139625'\``).then(msg => msg.delete(12000));
                }
                if (!member.roles.some(r => canacceptremoverole.includes(r.name))){
                    return channel.send(`\`[ERROR]\` ${member} \`недостаточно прав доступа.\``).then(msg => msg.delete(7000));
                }
                let field_author = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[0].value.split(/ +/)[1]);
                let field_user = server.members.find(m => "<@" + m.id + ">" == message.embeds[0].fields[1].value.split(/ +/)[1]);
                let field_role = server.roles.find(r => "<@&" + r.id + ">" == message.embeds[0].fields[2].value.split(/ +/)[3]);
                let field_channel = server.channels.find(c => "<#" + c.id + ">" == message.embeds[0].fields[3].value.split(/ +/)[0]);
                if (!field_user.roles.some(r => r.id == field_role.id)){
                    if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id);
                    return message.delete();
                }
                field_user.removeRole(field_role);
                channel.send(`\`[ACCEPT]\` <@${member.id}> \`одобрил снятие роли (${field_role.name}) от\` <@${field_author.id}>, \`пользователю\` <@${field_user.id}>, \`с ID:\` || \`${field_user.id}\` ||`);
                field_channel.send(`\`У игрока\` <@${field_user.id}>, \`снята роль\`  <@&${field_role.id}>  \`по запросу от\` <@${field_author.id}> \`Одобрил:\` <@${member.id}>`);
                if (snyatie.has(field_author.id + `=>` + field_user.id)) snyatie.delete(field_author.id + `=>` + field_user.id);
                return message.delete();
            }
        }
    }
});
