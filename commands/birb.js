const { MessageEmbed } = require("discord.js")
const { redditImage, getColor } = require("../utils.js")
const fetch = require("node-fetch")

const cooldown = new Map()

module.exports = {
    name: "birb",
    description: "get a random picture of a birb",
    category: "fun",
    run: async (message, args) => {
        if (!message.guild.me.hasPermission("EMBED_LINKS")) {
            return message.channel.send("❌ \ni am lacking permission: 'EMBED_LINKS'");
        }

        if (cooldown.has(message.member.id)) {
            const init = cooldown.get(message.member.id)
            const curr = new Date()
            const diff = Math.round((curr - init) / 1000)
            const time = 5 - diff

            const minutes = Math.floor(time / 60)
            const seconds = time - minutes * 60

            let remaining

            if (minutes != 0) {
                remaining = `${minutes}m${seconds}s`
            } else {
                remaining = `${seconds}s`
            }


            return message.channel.send("❌\nstill on cooldown for " + remaining );
        }

        const { birbCache } = require("../utils.js")

        if (birbCache.size < 1) {
            return message.channel.send("❌\nplease wait a couple more seconds..")
        }

        cooldown.set(message.member.id, new Date());

        setTimeout(() => {
            cooldown.delete(message.member.id);
        }, 5000);

        const birbLinks = Array.from(birbCache.keys())

        const subredditChoice = birbLinks[Math.floor(Math.random() * birbLinks.length)]

        const allowed = birbCache.get(subredditChoice)

        const chosen = allowed[Math.floor(Math.random() * allowed.length)]

        const a = await redditImage(chosen, allowed)

        if (a == "lol") {
            return message.channel.send("❌\nunable to find birb image")
        }

        const image = a.split("|")[0]
        const title = a.split("|")[1]
        let url = a.split("|")[2]
        const author = a.split("|")[3]

        url = "https://reddit.com" + url

        const color = getColor(message.member);

        const subreddit = subredditChoice.split("r/")[1].split(".json")[0]

        const embed = new MessageEmbed()
            .setColor(color)
            .setTitle(title)
            .setAuthor("u/" + author + " | r/" + subreddit)
            .setURL(url)
            .setImage(image)
            .setFooter("bot.tekoh.wtf")

        message.channel.send(embed).catch(() => {
            return message.channel.send("❌\ni may be missing permission: 'EMBED_LINKS'")
        })
    }
}