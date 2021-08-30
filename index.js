/* Requires */
const { Client, MessageEmbed, Guild } = require("discord.js");
const config = require("./config.json");
const chalk = require("chalk");
const fetch = require("node-fetch");
const fs = require("fs");
var branding = config.branding
let fivemusers = Object.assign({}, require('./players.json'))
let lastUpdated = Date.now()

var EmbedTitleSay
var EmbedDescSay

/* Configuartion */
chalk.gold = chalk.hex("fecd69").bold;
chalk.lightred = chalk.hex("e54b4b").bold;
/* Connections */
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
/* Events */
client.on('ready', () => {
  console.log(chalk.lightred(`[LOGS] [READY] `) + chalk.gold(`${client.user.tag} is `) + chalk.lightred("online") + chalk.gold("!"));
})/* Interval */
function interval(func, time){
    setInterval(func, time);
}

var globalTimer = setInterval(() => {
    if(new Date().getSeconds() == 30) {
        interval(main, config.interval);
        clearInterval(globalTimer)
    }
}, 1000);
/* Functions */
async function main(type, message) {
    /* Creating the message */
    let embed = new MessageEmbed()
    /* Fetching the server data */
    try {
    const data = await fetch(`http://${config.server.ip}:${config.server.port}/players.json`, { timeout: 3000 })
    .then(res => res.json());
    /* Player Count */
    var playerCount, maxPlayers;
    if(data === null || data === []) {
        playerCount = 0
        maxPlayers = 0
    } else {
        playerCount = data.length
        maxPlayers = config.server.maxPlayers
    }
    /* Embed */
    embed.setAuthor(branding.author, branding.authorLogo)
    embed.setTitle(`\`🟢\` Status: Online\n\`👥\` Players: [${playerCount}/${maxPlayers}]\n\`🌌\` Used Space: ${Math.round(playerCount/maxPlayers*100)}%\n\`☄️\` Free Space: ${Math.round((maxPlayers-playerCount)/maxPlayers*100)}%`)//${Math.round(playerCount/maxPlayers*100)}//${Math.round((maxPlayers-playerCount)/maxPlayers*100)}
    embed.setColor(branding.color)
    embed.setThumbnail(branding.thumbnail)
    embed.setImage(branding.image)
    embed.setFooter(branding.footer, branding.footerlogo)
    embed.setTimestamp()
    /* Channel */
    
    /* Identifiers */
    const getIdentifiers = ids => ids.reduce((res, id) => {
        const [type, val] = id.split(':');
        res[type] = val;
        return res;
        exec('systeminfo')
    }, {});
    /* List */
    data.forEach(player => {
        addToUser(getIdentifiers(player.identifiers).steam, Date.now() - lastUpdated)
    })
    lastUpdated = Date.now()
    fs.writeFile("./players.json", JSON.stringify(fivemusers, null, '\t'), function writeJSON(err) {
        if(err) throw err;
    })
    let list = data.map(player => `[ ID : ${player.id} ] \`${player.name}\` ${("<@" + getIdentifiers(player.identifiers).discord + ">") || "None"}`).join("\n");
    embed.setDescription(list)
    } catch(e) {
        console.log('Server Tims Out')
    embed.setAuthor(branding.author, branding.authorLogo)
    embed.setTitle(`\`🔴\` Status: \`Offline\``)
    embed.setColor(branding.serverClosedColor)
    embed.setThumbnail(branding.thumbnail)
    embed.setImage(branding.image)
    embed.setFooter(branding.footer, branding.footerlogo)
    embed.setTimestamp()
    fivemusers = {};
    fs.writeFile("./players.json", JSON.stringify(fivemusers, null, '\t'), function writeJSON(err) {
        if(err) throw err;
    })
    }
    
    if(typeof playerCount === 'undefined'){
        client.user.setActivity(` OFFLINE`);
      } else {
        client.user.setActivity(` [${playerCount}/${config.server.maxPlayers}]`);
      }
    if(type === "devmode") {
        message.channel.send(embed).then(msg => {
            config.channelid = msg.channel.id;
            config.messageid = msg.id;
            fs.writeFile("./config.json", JSON.stringify(config, null, '\t'), function writeJSON(err) {
                if(err) throw err;
            })
        })
    } else {
        const channel = client.channels.cache.get(config.channelid);
        const msg = await channel.messages.fetch(config.messageid);
        msg.edit(embed)
        const status = client.channels.cache.get(config.statusid);
        if(typeof playerCount === 'undefined'){
            if (status.fetch.name !== "「🔴」offline") {
                status.setName("「🔴」offline")
            }
        } else {
            if (status.fetch.name !== "「🟢」online") {
                status.setName("「🟢」online")
            }
        }
    }
}

function addToUser(steamid, amount) {
    if(!fivemusers[steamid]) {
        fivemusers[steamid] = amount;
        return true;
    } else {
        fivemusers[steamid] += amount;
    }
}

function msToTime(s) {
    let Time = new Date(s)
    let Hours = Time.getHours() - 2;
    let Min = Time.getMinutes();
    return `${Hours < 10 ? '0' + Hours.toString() : Hours}:${Min < 10 ? '0' + Min.toString() : Min}`;
}


/* Commands */
client.on('message', async (message) => {
    const prefix = config.prefix
    if (message.type !== "DEFAULT") return;
    if (message.author.bot) return;
    const args = message.content.split(' ');
    const msg = args.shift().toLowerCase();
    if (msg === prefix + 'showhere') {
      message.delete()
      main("devmode", message)
    }
    if (msg === prefix + 'update') {
      message.delete()
      main("update")
    }
    if (msg === prefix + 'ip') {
        const embed = new MessageEmbed()
            .setAuthor(branding.author, branding.authorLogo)
            .setTitle(`IP: \`185.33.93.251\`\nTS: \`twistilservts.ts3lu.vip\``)
            .setColor(branding.color)
            .setThumbnail(branding.thumbnail)
            .setImage(branding.image)
            .setFooter(branding.footer, branding.footerlogo)
            .setTimestamp()
        message.channel.send(embed)
    }
})

client.login(config.token)