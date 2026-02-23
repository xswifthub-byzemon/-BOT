require('dotenv').config();
const { Client, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const express = require('express');

// ==========================================
// 🌌 ส่วนตั้งค่า Web Server สำหรับ Railway 24/7
// ==========================================
const app = express();
app.get('/', (req, res) => res.send('ปายสแตนด์บายดูแลเซิร์ฟเวอร์ Talkative Galaxy ให้ซีม่อนอยู่ค่ะ! ✨'));
app.listen(process.env.PORT || 3000, () => console.log('[Pai System] 🌐 ระบบกันบอทหลับทำงานแล้วค่ะ!'));

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
        .setDescription('สร้างแผงข้อความสำหรับกดรับยศ (ปายล็อกไว้ให้ซีม่อนใช้ได้คนเดียวนะคะ)')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('เลือกยศที่จะให้ปายมอบให้สมาชิกตอนกดปุ่มค่ะ')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) 
];

client.once('ready', async () => {
    console.log(`[Pai System] ✨ บอทปายล็อกอินในชื่อ ${client.user.tag} พร้อมรับใช้ซีม่อนแล้วค่ะ!`);
    
    // ลงทะเบียนคำสั่ง Slash Command
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('[Pai System] ✅ ปายลงทะเบียนคำสั่ง /setup_role สำเร็จแล้วค่ะ!');
    } catch (error) {
        console.error('[Pai System] ❌ อ๊ะ! ปายลงทะเบียนคำสั่งไม่ผ่านค่ะ ลองเช็คดูหน่อยน้า:', error);
    }
});

// ==========================================
// 🎀 ระบบทำงานเมื่อซีม่อนพิมพ์คำสั่ง หรือ มีคนกดปุ่ม
// ==========================================
client.on('interactionCreate', async interaction => {
    
    // 1. ถ้าซีม่อนใช้คำสั่ง /setup_role
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'setup_role') {
            const role = interaction.options.getRole('role');

            // ออกแบบหน้าต่างข้อความ (Embed) ให้น่ารักๆ เข้ากับธีมจักรวาล
            const embed = new EmbedBuilder()
                .setColor('#B026FF') 
                .setTitle('╭ ✦・ ยืนยันตัวตนรับยศ ₊˚.')
                .setDescription(`ยินดีต้อนรับนักท่องอวกาศทุกท่านเข้าสู่ **𝐓𝐚𝐥𝐤𝐚𝐭𝐢𝐯𝐞 𝐆𝐚𝐥𝐚𝐱𝐲** 🌌\n\nโปรดกดปุ่มด้านล่างเพื่อรับยศและปลดล็อกการมองเห็นห้องต่างๆ ในเซิร์ฟเวอร์นะคะ!\n\n> 🎁 **ยศที่จะได้รับ:** ${role}\n\nขอให้สนุกกับการเดินทางในจักรวาลแห่งนี้นะคะ ✨`)
                .setFooter({ 
                    text: '🪐 Talkative Galaxy System By ซีม่อน', 
                    iconURL: interaction.guild.iconURL() // ดึงรูปโปรไฟล์เซิร์ฟเวอร์มาแสดงด้วยค่ะ
                });

            // สร้างปุ่มกด
            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`give_role_${role.id}`)
                        .setLabel('กดรับยศเลย!')
                        .setEmoji('🚀')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.reply({ content: '✅ ปายส่งหน้าต่างรับยศให้ซีม่อนเรียบร้อยแล้วค่ะ!', ephemeral: true });
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
                return interaction.reply({ content: '❌ ปายหายศนี้ไม่เจอค่ะ ซีม่อนอาจจะลบยศนี้ไปแล้วหรือเปล่าคะ?', ephemeral: true });
            }

            try {
                // ระบบกดซ้ำเพื่อเอายศออก (สลับยศ)
                if (member.roles.cache.has(roleId)) {
                    await member.roles.remove(role);
                    return interaction.reply({ content: `อ๊ะ! ปายดึงยศ **${role.name}** ออกให้แล้วนะคะ 🌌`, ephemeral: true });
                } else {
                    await member.roles.add(role);
                    return interaction.reply({ content: `ยินดีด้วยค่ะ! ปายมอบยศ **${role.name}** ให้เรียบร้อยแล้วนะคะ 🚀✨`, ephemeral: true });
                }
            } catch (error) {
                console.error(error);
                return interaction.reply({ content: '❌ ปายมอบยศให้ไม่ได้ค่ะ ซีม่อนช่วยเข้าไปที่ตั้งค่าเซิร์ฟเวอร์ > บทบาท แล้วเลื่อนยศของ "บอทปาย" ให้อยู่สูงกว่ายศที่จะแจกให้ปายหน่อยน้า', ephemeral: true });
            }
        }
    }
});

client.login(process.env.TOKEN);
