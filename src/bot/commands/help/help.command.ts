import { ChannelMessage, EMarkdownType, MezonClient } from 'mezon-sdk';
import { CommandMessage } from 'src/bot/base/command.abstract';
import { Command } from 'src/bot/base/commandRegister.decorator';
import { CommandStorage } from 'src/bot/base/storage';
import { DynamicCommandService } from 'src/bot/services/dynamic.service';
import { MezonClientService } from 'src/mezon/services/mezon-client.service';

@Command('help')
export class HelpCommand extends CommandMessage {
  constructor(
    clientService: MezonClientService,
    private dynamicCommandService: DynamicCommandService,
  ) {
    super(clientService);
  }

  async execute(args: string[], message: ChannelMessage) {
    const messageChannel = await this.getChannelMessage(message);

    if (args[0] === 'user' && message.sender_id === '1827994776956309504') {
      if (args[1]) {
        const user = this.client.users.get(args[1]);
        let messageContent = `userId: ${user?.id}, dmId: ${user?.dmChannelId}`;
        if (!user) {
          messageContent = 'Not found user';
        }
        return await messageChannel?.reply({
          t: messageContent,
          mk: [{ type: EMarkdownType.PRE, s: 0, e: messageContent.length }],
        });
      }

      const users = Array.from(this.client.users.values());
      const countDMChannel = users.filter((u) => !!u.dmChannelId).length;
      return await messageChannel?.reply({
        t: `Count init: ${countDMChannel}`,
      });
    }

    const allCommands = CommandStorage.getAllCommands();
    const allCommandsCustom =
      this.dynamicCommandService.getDynamicCommandList();
    const hidenCommandList = [
      'update',
      'register',
      'toggleactive',
      'checkchannel',
      'toggleprivatechannel',
      'togglechannel',
    ];
    const allCommandKeys = Array.from(allCommands.keys()).filter(
      (item) => !hidenCommandList.includes(item),
    );
    const messageContent =
      'Utility - Help Menu' +
      '\n' +
      '• Utility (' +
      allCommandKeys.length +
      ')' +
      '\n' +
      allCommandKeys.join(', ');
    const messageSent = await messageChannel?.reply({
      t: messageContent,
      mk: [{ type: EMarkdownType.PRE, s: 0, e: messageContent.length }],
    });
    return messageSent;
  }
}
