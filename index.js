// Load the environment variables
require('dotenv/config');

// Import required modules from discord.js and openai
const {Client, IntentsBitField} = require('discord.js');
const { Configuration, OpenAIApi} = require('openai');

// Initialize the Discord bot client with specific intents
const client = new Client({ 
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

// Event listener for when the bot is ready
client.on('ready', () => {
    console.log("The bot is online!");
})

// Configure the OpenAI API
const configuration = new Configuration({
    apiKey: process.env.API_KEY,
})

// Initialize the OpenAI API
const openai = new OpenAIApi(configuration);

// Event listener for when a new message is created
client.on('messageCreate', async (message) => {
    // Ignore messages from bots
    if (message.author.bot) return;
    // Only respond to messages from a specific channel
    if (message.channel.id !== process.env.CHANNEL_ID_1 && message.channel.id !== process.env.CHANNEL_ID_2) return;
    // Ignore messages starting with '!'
    if (message.content.startsWith('!')) return;

    // Check if the message is from you and if the bot is mentioned in the message
    const your_user_id = 'DISCORD USER ID'; // Replace with your Discord user ID
    const bot_mentioned = message.mentions.users.has(client.user.id);
    if (message.author.id !== your_user_id || !bot_mentioned) return;

    // Initialize the conversation log with a system message
    let conversationLog = [{ role: 'system', content: 'You are friendly.' }];

    // Send a typing indicator while processing the response
    await message.channel.sendTyping();

    // Fetch previous messages in the channel (up to 15)
    let prevMessages = await message.channel.messages.fetch({ limit: 15});
    prevMessages.reverse();

// Iterate through the previous messages and add them to the conversation log
prevMessages.forEach((msg) => {
    // Ignore messages starting with '!'
    if (message.content.startsWith('!')) return;
    // Ignore messages from other bots
    if (msg.author.id !== client.user.id && message.author.bot) return;
    // Ignore messages from other users
    if (msg.author.id !== your_user_id) return;

    // Add the message to the conversation log
    conversationLog.push({
        role: 'user',
        content: msg.content,
    });
});

    // Generate a response using the OpenAI API
    const result = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
    })

    // Reply with the generated response
    message.reply(result.data.choices[0].message);

    // Clear the conversation log array
    conversationLog.length = 0;

});

// Login the bot using the TOKEN from the environment variables
client.login(process.env.TOKEN);
