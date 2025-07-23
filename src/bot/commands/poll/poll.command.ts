import { ChannelMessage } from 'mezon-sdk';
import { Command } from 'src/bot/base/commandRegister.decorator';
import { EmbedProps, MEZON_EMBED_FOOTER } from 'src/bot/constants/configs';
import { CommandMessage } from 'src/bot/base/command.abstract';
import { getRandomColor } from 'src/bot/utils/helps';
import { MezonClientService } from 'src/mezon/services/mezon-client.service';
import { PollService } from './poll.service';

@Command('poll')
export class PollCommand extends CommandMessage {
  constructor(
    clientService: MezonClientService,
    private pollService: PollService,
  ) {
    super(clientService);
  }

  async execute(args: string[], message: ChannelMessage, commandName?: string) {
    const messageChannel = await this.getChannelMessage(message);
    const defaultNumberOption = 2;
    const color = getRandomColor();
    const embed: EmbedProps[] = [
      {
        color,
        title: `POLL CREATOR`,
        fields: this.pollService.generateFieldsCreatePoll(defaultNumberOption),
        timestamp: new Date().toISOString(),
        footer: MEZON_EMBED_FOOTER,
      },
    ];
    const components = this.pollService.generateComponentsCreatePoll(
      defaultNumberOption,
      color,
      (message.clan_nick || message.username) ?? '',
      message.clan_id ?? '',
      message.sender_id,
    );
    await messageChannel?.reply({ embed, components });
  }
}
