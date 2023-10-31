import { Telegraf } from 'telegraf';
import { message } from "telegraf/filters";
import {code} from 'telegraf/format'
import {oga} from './oga.js'
import {openai} from './openai.js'

const bot = new Telegraf("6555063950:AAFoeXfhaewy-60cA3rF9yPj-OHUTL0H4Dk")

bot.on(message('voice'),async ctx =>{
 try{
  await ctx.reply(code('сообщение принял, жду ответ от сервера...'))
  const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
  const user_id = String(ctx.message.from.id)
  const ogaPath = await oga.create(link.href,user_id)
  const mp3Path = await oga.toMp3(ogaPath,user_id)
  const text = await openai.transcription(mp3Path)
  const messages = [{role: openai.roles.USER, content: text}]
  const responce = await openai.chat(messages)

  await ctx.reply(code(`Ваш запрос: ${text}`))
  await ctx.reply(`ответ: ${responce}`)
 } catch(e){
  console.log("error while voice message", e)
 }
})
 
bot.command('start', async(ctx) =>{
 await ctx.reply(JSON.stringify(ctx.message, null ,2))
})


bot.launch()

process.once('SIGINT',() => bot.stop('SIGINT'));
process.once('SIGTERM',() => bot.stop('SIGTERM'))