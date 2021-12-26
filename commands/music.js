const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, MessageAttachment } = require('discord.js');
const { Collection } = require('discord.js');
const { getInfo }  = require( 'ytdl-core');
const { raw }  = require( 'youtube-dl-exec');
const Voice = require('@discordjs/voice');
const ytsr = require('ytsr');
const ytdl = require('ytdl-core-discord');

//magic inports

let audioPlayers = {};

module.exports = {
  commands: [
    {
      data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Adds music to queue.')
        .addStringOption(option => option.setName('url').setDescription('Music url to play')),
      async execute(interaction, guildConfig) {
        try{
        interaction.reply({
          content: '*Processing...*',
          ephemeral: true
        });
        
        const guild = interaction.guild;
        //play
        let voiceChannel = interaction.member.voice.channel;
        if(!voiceChannel){
          return interaction.reply({
            content: `*You aren't on any accesible voice channels*`,
            ephemeral: true
          });
        }

        let voiceConnection = Voice.getVoiceConnection(guild.id);
        if(!voiceConnection){
          voiceConnection = await Voice.joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
          });
        }
        if(!voiceConnection){
          return interaction.reply({
            content: `*Cant join voice channel.*`,
            ephemeral: true
          });
        }
        //console.log(voiceConnection);

        let audioPlayer;
        if(!audioPlayers[guild.id]) audioPlayers[guild.id] = Voice.createAudioPlayer();
        audioPlayer = audioPlayers[guild.id];
        
        audioPlayer.on('error', error => {
          //console.error('Error:', error.message, 'with track', error.resource.metadata.title);
          console.error('Error:', error.message);
        });

        let url = interaction.options.getString('url')
        
        if(!url /*|| !url.includes('PASS')*/){
          return interaction.reply({
            content: `*Missing url*`,
            ephemeral: true
          });
        }
        /*url = url.replace('PASS','');*/
        console.log('url: ' + url);
        
        let filter = await ytsr.getFilters(url);
        filter = filter.get('Type').get('Video');
        let info = await ytsr(filter.url, {limit: 1});
        let videoInfo = info.items[0];
          
          console.log(videoInfo.url);
          audioPlayer.play(Voice.createAudioResource(await ytdl(videoInfo.url), { type: 'opus' }));
          /*let resource = new Promise((resolve, reject) => {
            const process = raw(
              videoInfo.url,
              {
                o: '-',
                q: '',
                f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
                r: '1M',
                'no-call-home': '',
                'no-cache-dir': ''
              },
              { stdio: ['ignore', 'pipe', 'ignore'] },
            );

            if(!process.stdout){
              console.log("ERROR");
              reject(new Error('No stdout'));
              return;
            }

            const stream = process.stdout;
            function onError(error){
              console.log(error);
              if(!process.killed) process.kill();
              stream.resume();
              reject(error);
            }
            process.once('spawn', () => {
              Voice.demuxProbe(stream)
              .then((probe) => resolve(Voice.createAudioResource(probe.stream, {
                metadata: this,
                inputType: probe.type
              })))
              .catch(onError);
            })
            .catch(onError);
          }).then((res) => {
            console.log('started playing');
            audioPlayer.play(res);
            audioPlayer.play(await ytdl(videoInfo.url), { type: 'opus' });
            interaction.channel.send('Playing [' + videoInfo.title + '](' + videoInfo.url + ')');
          });*/

          interaction.channel.send('Playing [' + videoInfo.title + '](' + videoInfo.url + ')');
          
          let subscription = voiceConnection.subscribe(audioPlayer);
        }catch(err){console.log(err);}
      }
    },
    {
      data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops media'),
      async execute(interaction, guildConfig) {
        
        
        const guild = interaction.guild;
        audioPlayers[guild.id].stop();
        console.log(audioPlayers[guild.id]);
        return interaction.reply({
          content: `*Stopped*`,
          ephemeral: false
        });
      }
    },
    {
      data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pauses media in queue'),
      async execute(interaction, guildConfig) {
        
        
        const guild = interaction.guild;
        audioPlayers[guild.id].pause();
        
        return interaction.reply({
          content: `*Paused*`,
          ephemeral: false
        });
      }
    },
    {
      data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resumes media in queue'),
      async execute(interaction, guildConfig) {
        
        
        const guild = interaction.guild;
        audioPlayers[guild.id].unpause();
        
        return interaction.reply({
          content: `*Resumed*`,
          ephemeral: false
        });
      }
    }
  ]
};
