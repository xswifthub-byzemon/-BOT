require('dotenv').config();
const { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const express = require('express');

// ==========================================
// 🌌 ส่วนตั้งค่า Web Server สำหรับ Railway 24/7
// ==========================================
const app = express();
app.get('/', (req, res) => res.send('ระบบดูแลเซิร์ฟเวอร์ Talkative Galaxy สแตนด์บายอยู่ค่ะ! ✨'));
app.listen(process.env.PORT || 3000, () => console.log('[System] 🌐 ระบบกันบอทหลับทำงานแล้วค่ะ!'));

// ==========================================
// 🤖 ส่วนตั้งค่า Discord Bot
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
    ],
    partials: [Partials.User, Partials.GuildMember]
});

// --- สร้างคำสั่ง /setup_role ---
const commands = [
    new SlashCommandBuilder()
        .setName('setup_role')
        .setDescription('สร้างแผงข้อความสำหรับกดรับยศ (ล็อกไว้ให้ Owner ใช้ได้คนเดียว)')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('เลือกยศที่จะมอบให้สมาชิกตอนกดปุ่มค่ะ')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) 
];

client.once('ready', async () => {
    console.log(`[System] ✨ บอทล็อกอินในชื่อ ${client.user.tag} พร้อมทำงานแล้วค่ะ!`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('[System] ✅ ลงทะเบียนคำสั่ง /setup_role สำเร็จแล้วค่ะ!');
    } catch (error) {
        console.error('[System] ❌ ลงทะเบียนคำสั่งไม่ผ่านค่ะ ลองเช็คดูหน่อยน้า:', error);
    }
});

// ==========================================
// 🎀 ระบบทำงานเมื่อพิมพ์คำสั่ง หรือ มีคนกดปุ่ม
// ==========================================
client.on('interactionCreate', async interaction => {
    
    // 1. ถ้ามีการใช้คำสั่ง /setup_role
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'setup_role') {
            
            // 🔒 เช็คว่าเป็น Owner หรือเปล่า
            if (interaction.user.id !== process.env.OWNER_ID) {
                return interaction.reply({ content: '❌ ขออภัยค่ะ คำสั่งนี้สงวนไว้ให้เจ้าของเซิร์ฟเวอร์ใช้งานเท่านั้นนะคะ', ephemeral: true });
            }

            const role = interaction.options.getRole('role');

            const embed = new EmbedBuilder()
                .setColor('#B026FF') 
                .setDescription([
                    `╭┈┈ ✧ : รับยศเปิดโซนต่างๆ ˗ˏˋ ꒰ 🦋 ꒱ ˎˊ˗`,
                    `│`,
                    `│ <a:DG36:1451619653746036910> · กดปุ่มรับยศเท่านั้น`,
                    `│`,
                    `│ <a:1001:1451585309757149227> · ยศที่ได้ ${role}`,
                    `│`,
                    `│ <a:emoji_2:1449148118690959440> · **𝐓𝐚𝐥𝐤𝐚𝐭𝐢𝐯𝐞 𝐆𝐚𝐥𝐚𝐱𝐲 𝐂𝐨𝐦𝐦𝐮𝐧𝐢𝐭𝐲** ╰(° ͜ʖ °)╯`,
                    `│`,
                    `│ <a:1004:1451585026935488563> · ยินดีต้อนรับทุกคนน้า`,
                    `│`,
                    `│ <a:emoji_34:1450185126901321892> · อ่านกฎที่ห้องนี้ <#1449126363725561896>`,
                    `╰┈┈ ✧ : ➳ By Zemon Źx ⚡`
                ].join('\n'))
                .setImage('https://cdn.discordapp.com/attachments/1449115719479590984/1454084461888278589/IMG_4820.jpg?ex=699d95af&is=699c442f&hm=7409acc2dd495cf386f0843e40fea69e7f5e54e5785cecd36d2e5a1a53c8f394&');

            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`give_role_${role.id}`)
                        .setLabel('กดรับยศเลย!')
                        .setEmoji('<a:__:1454165136913731594>')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.reply({ content: '✅ ส่งหน้าต่างรับยศเรียบร้อยแล้วค่ะ!', ephemeral: true });
            await interaction.channel.send({ embeds: [embed], components: [button] });
        }
    }

    // 2. ถ้ามีสมาชิกมากดปุ่มรับยศ
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('give_role_')) {
            const roleId = interaction.customId.split('_')[2];
            const role = interaction.guild.roles.cache.get(roleId);
            const member = interaction.member;

            if (!role) {
                return interaction.reply({ content: '❌ ไม่พบยศดังกล่าวในระบบค่ะ อาจถูกลบไปแล้ว', ephemeral: true });
            }

            try {
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(role);
                    return interaction.reply({ content: `✅ ดึงยศ **${role.name}** ออกให้เรียบร้อยแล้วค่ะ 🌌`, ephemeral: true });
                } else {
                    await member.roles.add(role);
                    return interaction.reply({ content: `✅ ยินดีด้วยค่ะ! คุณได้รับยศ **${role.name}** เรียบร้อยแล้วนะคะ 🚀✨`, ephemeral: true });
                }
            } catch (error) {
                console.error(error);
                return interaction.reply({ content: '❌ ระบบไม่สามารถมอบยศให้ได้ค่ะ กรุณาแจ้งแอดมินให้ตรวจสอบตำแหน่งของยศบอทในตั้งค่าเซิร์ฟเวอร์นะคะ', ephemeral: true });
            }
        }
    }
});

client.login(process.env.TOKEN);
