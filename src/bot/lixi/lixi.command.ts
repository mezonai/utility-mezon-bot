import {
  ChannelMessage,
  EButtonMessageStyle,
  EMarkdownType,
  EMessageComponentType,
} from 'mezon-sdk';
import { Command } from 'src/bot/base/commandRegister.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommandMessage } from 'src/bot/base/command.abstract';
import { MezonBotMessage } from 'src/bot/models/mezonBotMessage.entity';
import { getRandomColor } from 'src/bot/utils/helps';
import { MezonClientService } from 'src/mezon/services/mezon-client.service';
import { LixiService } from './lixi.service';
import { User } from '../models/user.entity';
import { EUserError } from '../constants/error';
import { EmbedProps, MEZON_EMBED_FOOTER } from '../constants/configs';

@Command('lixi')
export class LixiCommand extends CommandMessage {
  constructor(
    clientService: MezonClientService,
    @InjectRepository(MezonBotMessage)
    private mezonBotMessageRepository: Repository<MezonBotMessage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private lixiService: LixiService,
  ) {
    super(clientService);
  }

  async execute(args: string[], message: ChannelMessage) {
    const messageChannel = await this.getChannelMessage(message);
    if (message.username === 'Anonymous') {
      const content =
        '```' + `[Lixi] Anonymous can't use this command!` + '```';

      return await messageChannel?.reply({
        t: content,
        mk: [
          {
            type: EMarkdownType.TRIPLE,
            s: 0,
            e: content.length + 6,
          },
        ],
      });
    }

    const messageid = message.message_id;

    const onlyLixiSyntax =
      message?.content?.t && typeof message.content.t === 'string'
        ? message.content.t.trim() === '*lixi'
        : false;

    const embed: EmbedProps[] = [
      {
        color: getRandomColor(),
        title: `[Lixi]`,
        fields: [
          {
            name: 'description:',
            value: '',
            inputs: {
              id: `lixi-${messageid}-description-ip`,
              type: EMessageComponentType.INPUT,
              component: {
                id: `lixi-${messageid}-description-plhder`,
                placeholder: 'Ex. Write something',
                required: true,
                textarea: true,
              },
            },
          },
          {
            name: 'TotalAmount:',
            value: '',
            inputs: {
              id: `lixi-${messageid}-totalAmount-ip`,
              type: EMessageComponentType.INPUT,
              component: {
                id: `lixi-${messageid}-totalAmount-plhder`,
                required: true,
                defaultValue: 10000,
                type: 'number',
              },
            },
          },
          {
            name: 'MinLixi:',
            value: '',
            inputs: {
              id: `lixi-${messageid}-minLixi-ip`,
              type: EMessageComponentType.INPUT,
              component: {
                id: `lixi-${messageid}-minLixi-plhder`,
                required: true,
                defaultValue: 10000,
                type: 'number',
              },
            },
          },
          {
            name: 'NumLixi:',
            value: '',
            inputs: {
              id: `lixi-${messageid}-numLixi`,
              type: EMessageComponentType.INPUT,
              component: {
                id: `lixi-${messageid}-numLixi-plhder`,
                required: true,
                defaultValue: 1,
                type: 'number',
              },
            },
          },
        ],

        timestamp: new Date().toISOString(),
        footer: MEZON_EMBED_FOOTER,
      },
    ];
    const components = [
      {
        components: [
          {
            id: `lixi_CANCEL_${message.sender_id}_${message.clan_id}_${message.mode}_${message.is_public}_${getRandomColor()}_${message.clan_nick || message.username}_${0}_${0}_${messageid}`,
            type: EMessageComponentType.BUTTON,
            component: {
              label: `Cancel`,
              style: EButtonMessageStyle.SECONDARY,
            },
          },
          {
            id: `lixi_SUBMITCREATE_${message.sender_id}_${message.clan_id}_${message.mode}_${message.is_public}_${getRandomColor()}_${message.clan_nick || message.username}_${0}_${0}_${messageid}`,
            type: EMessageComponentType.BUTTON,
            component: {
              label: `Create`,
              style: EButtonMessageStyle.SUCCESS,
            },
          },
        ],
      },
    ];
    if (onlyLixiSyntax) {
      const messLixi = await messageChannel?.reply({
        embed,
        components,
      });
      if (!messLixi) return;
      const dataMezonBotMessage = {
        messageId: messLixi.message_id,
        userId: message.sender_id,
        clanId: message.clan_id,
        isChannelPublic: message.is_public,
        modeMessage: message.mode,
        channelId: message.channel_id,
        createAt: Date.now(),
        lixiResult: [[], 0, []],
      };
      await this.mezonBotMessageRepository.insert(dataMezonBotMessage);
      return;
    }
  }
}
