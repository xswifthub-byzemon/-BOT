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
        // ตั้งค่าพื้นฐานให้คนที่มีสิทธิ์ Admin เห็นคำสั่งนี้ (แต่ปายจะไปเช็คไอดีซีม่อนซ้ำอีกทีตอนกดใช้ค่ะ)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator) 
];

client.once('ready', async () => {
    console.log(`[Pai System] ✨ บอทปายล็อกอินในชื่อ ${client.user.tag} พร้อมรับใช้ซีม่อนแล้วค่ะ!`);
    
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
    
    // 1. ถ้ามีการใช้คำสั่ง /setup_role
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'setup_role') {
            
            // 🔒 ให้ปายเช็คก่อนว่าใช่ไอดีของซีม่อนมั้ย!
            if (interaction.user.id !== process.env.OWNER_ID) {
                return interaction.reply({ content: '❌ อ๊ะ! คำสั่งนี้ปายอนุญาตให้ซีม่อนใช้ได้แค่คนเดียวเท่านั้นนะคะ ขออภัยด้วยน้า', ephemeral: true });
            }

            const role = interaction.options.getRole('role');

            // แก้ไขดีไซน์ Embed ตามรูปแบบรูปภาพที่ซีม่อนส่งมาแบบเป๊ะๆ เลยค่ะ
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
                ].join('\n'));

            // ปุ่มกดที่ใส่อิโมจิเคลื่อนไหวตามที่ซีม่อนรีเควสต์ค่ะ
            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`give_role_${role.id}`)
                        .setLabel('กดรับยศเลย!')
                        .setEmoji('<a:__:1454165136913731594>')
                        .setStyle(ButtonStyle.Primary)
                );

            await interaction.reply({ content: '✅ ปายส่งหน้าต่างรับยศแบบใหม่สุดน่ารักให้ซีม่อนเรียบร้อยแล้วค่ะ!', ephemeral: true });
            await interaction.channel.send({ embeds: [embed], components: [button] });
        }
    }

    // 2. ถ้ามีสมาชิกมากดปุ่มรับยศ (ตรงนี้สมาชิกทุกคนกดได้ปกติค่ะ)
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('give_role_')) {
            const roleId = interaction.customId.split('_')[2];
            const role = interaction.guild.roles.cache.get(roleId);
            const member = interaction.member;

            if (!role) {
                return interaction.reply({ content: '❌ ปายหายศนี้ไม่เจอค่ะ ซีม่อนอาจจะลบยศนี้ไปแล้วหรือเปล่าคะ?', ephemeral: true });
            }

            try {
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
