import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.content === "!verify") {
    const userId = message.author.id;
    const qrUrl = `http://localhost:3001/qr/${userId}`;
    message.reply(
      `🧍‍♂️ Are you a human? Scan this QR to verify (simulated):\n${qrUrl}`
    );
  }

  if (message.content.startsWith("!simulate ")) {
    const userId = message.content.split(" ")[1];
    const response = await fetch(`http://localhost:3001/simulate/${userId}`);
    const result = await response.json();
    if (result.verified && message.guild) {
      const member = await message.guild.members.fetch(userId);
      const role = message.guild.roles.cache.find(
        (role) => role.name === "Verified"
      );
      if (role && member) {
        await member.roles.add(role);
        message.reply(`✅ Assigned 'Verified' role to <@${userId}>`);
      } else {
        message.reply(
          "⚠️ Could not assign role. Make sure 'Verified' role exists and the user is in the server."
        );
      }
    } else {
      message.reply("❌ Verification failed or user not found.");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
