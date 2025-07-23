import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { Command } from 'src/bot/base/commandRegister.decorator';
import { EmbedProps } from 'src/bot/constants/configs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommandMessage } from 'src/bot/base/command.abstract';
import { MezonBotMessage } from 'src/bot/models/mezonBotMessage.entity';
import { getRandomColor } from 'src/bot/utils/helps';
import { MezonClientService } from 'src/mezon/services/mezon-client.service';
import { PollService } from './poll.service';

@Command('poll')
export class PollCommand extends CommandMessage {
  constructor(
    clientService: MezonClientService,
    @InjectRepository(MezonBotMessage)
    private mezonBotMessageRepository: Repository<MezonBotMessage>,
    private pollService: PollService,
  ) {
    super(clientService);
  }

  async execute(args: string[], message: ChannelMessage) {
    const messageChannel = await this.getChannelMessage(message);
    if (message.clan_id === '1779484504377790464') {
      return;
    }
    let messageContent = '';
    const cmds = args
      .join(' ')
      .split('+')
      .map((s) => s.trim());

    let options = cmds.slice(1).filter(Boolean);

    let time = 0;

    const last = options[options.length - 1];
    const match = last?.match(/^(.*?)(?:\s*-\s*)(\d+)$/);

    if (match) {
      options[options.length - 1] = match[1].trim();
      time = +match[2];
    }
  
    if (
      !cmds.length ||
      !options.length ||
      options.length < 2 ||
      options.length > 10
    ) {
      const exampleText = `\nExample: *poll title + option1 + option2 + ... (- hours schedule) => Default 7 days \n- Set 5 hours countdown: *poll title + option1 + option2 - 5`;
      if (!cmds?.[0]) {
        messageContent = 'Poll title is not given!' + exampleText;
      } else if (!options.length) {
        messageContent = 'Poll options are not given!' + exampleText;
      } else if (options.length < 2) {
        messageContent = 'Please provide more than one choice!' + exampleText;
      } else if (options.length > 10) {
        messageContent =
          'Exceed the number of choices, maximum number of choices is 10';
      }
      return await messageChannel?.reply({
        t: messageContent,
        mk: [
          {
            type: EMarkdownType.PRE,
            s: 0,
            e: messageContent.length,
          },
        ],
      });
    }
    const colorEmbed = getRandomColor();
    const embedCompoents = this.pollService.generateEmbedComponents(options);
    const embed: EmbedProps[] = this.pollService.generateEmbedMessage(
      cmds[0],
      message.clan_nick || message.username!,
      colorEmbed,
      embedCompoents,
      time,
    );
    const components = this.pollService.generateButtonComponents({
      ...message,
      color: colorEmbed,
    });

    const pollMessageSent = await messageChannel?.reply({
      embed,
      components,
    });
    if (!pollMessageSent) return;
    const dataMezonBotMessage = {
      messageId: pollMessageSent.message_id,
      userId: message.sender_id,
      clanId: message.clan_id,
      isChannelPublic: message.is_public,
      modeMessage: message.mode,
      channelId: message.channel_id,
      content: cmds[0] + '_' + options.join('_'),
      createAt: Date.now(),
      expireAt:
        Date.now() + (time ? +time * 1 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000),
      pollResult: [],
    };
    await this.mezonBotMessageRepository.insert(dataMezonBotMessage);
    return null;
  }
}
