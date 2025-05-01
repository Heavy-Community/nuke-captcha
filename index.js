import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.content === "!verify") {
    const userId = message.author.id;
    const qrUrl = `http://localhost:3001/qr/${userId}`;
    message.reply(`🔗 Scan this QR to verify with zkPassport:\n${qrUrl}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
