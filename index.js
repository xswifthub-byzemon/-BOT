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
        GatewayIntentBits.MessageContent, // 🌟 ปายเพิ่มอันนี้เพื่อให้บอทอ่านข้อความในห้องได้ค่ะ
    ],
    partials: [Partials.User, Partials.GuildMember]
});

// 🌟 ตัวแปรเก็บความจำว่าห้องไหนแจกยศอะไร (รีเซ็ตเมื่อบอทรีสตาร์ท)
let dotSetup = {
    channelId: null,
    roleId: null
};

// --- สร้างคำสั่งต่างๆ ---
const commands = [
    new SlashCommandBuilder()
        .setName('setup_role')
        .setDescription('สร้างแผงข้อความสำหรับกดรับยศ (ล็อกไว้ให้ Owner ใช้ได้คนเดียว)')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('เลือกยศที่จะมอบให้สมาชิกตอนกดปุ่มค่ะ')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
        
    // 🌟 คำสั่งใหม่สำหรับตั้งค่าห้องพิมพ์จุด .
    new SlashCommandBuilder()
        .setName('setup_dot')
        .setDescription('ตั้งค่าห้องพิมพ์จุด . เพื่อรับยศ (ล็อกไว้ให้ Owner ใช้ได้คนเดียว)')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('เลือกห้องแชทที่จะให้สมาชิกพิมพ์ . ค่ะ')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('เลือกยศที่จะมอบให้สมาชิกค่ะ')
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
        console.log('[System] ✅ ลงทะเบียนคำสั่งทั้งหมดสำเร็จแล้วค่ะ!');
    } catch (error) {
        console.error('[System] ❌ ลงทะเบียนคำสั่งไม่ผ่านค่ะ ลองเช็คดูหน่อยน้า:', error);
    }
});

// ==========================================
// 🎀 ระบบทำงานเมื่อพิมพ์คำสั่ง หรือ มีคนกดปุ่ม
// ==========================================
client.on('interactionCreate', async interaction => {
    
    // 1. ถ้ามีการใช้คำสั่ง (Slash Commands)
    if (interaction.isChatInputCommand()) {
        
        // 🔒 เช็คว่าเป็น Owner หรือเปล่า (ใช้ได้กับทุกคำสั่งของซีม่อน)
        if (interaction.user.id !== process.env.OWNER_ID) {
            return interaction.reply({ content: '❌ ขออภัยค่ะ คำสั่งนี้สงวนไว้ให้เจ้าของเซิร์ฟเวอร์ใช้งานเท่านั้นนะคะ', ephemeral: true });
        }

        // --- คำสั่ง /setup_role ---
        if (interaction.commandName === 'setup_role') {
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

        // --- 🌟 คำสั่ง /setup_dot ---
        if (interaction.commandName === 'setup_dot') {
            const channel = interaction.options.getChannel('channel');
            const role = interaction.options.getRole('role');

            // บันทึกค่าลงในความจำของบอท
            dotSetup.channelId = channel.id;
            dotSetup.roleId = role.id;

            await interaction.reply({ 
                content: `✅ ตั้งค่าสำเร็จแล้วค่ะ! ตอนนี้ใครพิมพ์ \`.\` ในห้อง ${channel} บอทจะแจกยศ **${role.name}** ให้ทันทีเลยค่ะ 🌌`, 
                ephemeral: true 
            });
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

// ==========================================
// 🌟 ระบบอ่านข้อความ สำหรับแจกยศตอนพิมพ์ .
// ==========================================
client.on('messageCreate', async message => {
    // ป้องกันบอทพิมพ์เอง หรือระบบยังไม่ได้ตั้งค่า
    if (message.author.bot || !dotSetup.channelId) return;

    // เช็คว่าข้อความนี้ส่งมาในห้องที่ซีม่อนตั้งค่าไว้หรือเปล่า
    if (message.channel.id === dotSetup.channelId) {
        
        // ถ้าพิมพ์ . ถูกต้อง
        if (message.content === '.') {
            const role = message.guild.roles.cache.get(dotSetup.roleId);
            if (role) {
                try {
                    await message.member.roles.add(role);
                    // ปายจะลบจุดทิ้งเพื่อความสะอาดของห้องนะคะ (ถ้าซีม่อนไม่อยากให้ลบ ลบบรรทัดล่างออกได้เลยค่ะ)
                    await message.delete().catch(() => {}); 
                } catch (error) {
                    console.error('[System] มอบยศไม่ได้ เช็คตำแหน่งยศบอทด้วยน้า');
                }
            }
        } 
        // ถ้าพิมพ์คำอื่นที่ไม่ใช่ .
        else {
            try {
                // ลบข้อความผิดทิ้งทันที
                await message.delete();
                // ส่งข้อความเตือนแท็กชื่อ แล้วตั้งเวลาลบทิ้งใน 5 วินาที
                const warning = await message.channel.send(`❌ อ๊ะ! <@${message.author.id}> ห้องนี้อนุญาตให้พิมพ์แค่ \`.\` เพื่อรับยศเท่านั้นนะคะ!`);
                setTimeout(() => {
                    warning.delete().catch(() => {}); // ลบทิ้งหลัง 5 วิ
                }, 5000);
            } catch (error) {
                console.error('[System] ไม่มีสิทธิ์ลบข้อความค่ะ');
            }
        }
    }
});

client.login(process.env.TOKEN);
