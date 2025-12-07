import { OnEvent } from '@nestjs/event-emitter';
import { ChannelMessage, Events } from 'mezon-sdk';
import { CommandBase } from '../base/command.handle';
import { Injectable } from '@nestjs/common';
import { PollTrackerService } from '../services/pollTracker.service';

@Injectable()
export class ListenerChannelMessage {
  constructor(
    private commandBase: CommandBase,
    private pollTrackerService: PollTrackerService,
  ) {}

  @OnEvent(Events.ChannelMessage)
  async handleCommand(message: ChannelMessage) {
    if (message.code) return; // Do not support case edit message
    try {
      const content = message.content.t;
      if (typeof content == 'string' && content.trim()) {
        const firstLetter = content.trim()[0];
        switch (firstLetter) {
          case '*':
            await this.commandBase.execute(content, message);
            break;
          default:
            return;
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  @OnEvent(Events.ChannelMessage)
  async handleMessageCreated(data: ChannelMessage) {
    const clanId = data?.clan_id;
    const channelId = data?.channel_id;
    const messageId = data?.message_id;
    if (!clanId || !channelId || !messageId) return;
    this.pollTrackerService.handleNewMessage(
      clanId,
      channelId,
      messageId,
      data,
    );
  }
}
