import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MezonBotMessage } from 'src/bot/models/mezonBotMessage.entity';
import { IsNull, LessThanOrEqual, Not, Repository } from 'typeorm';
import { PollService } from './poll.service';
import { CronJob } from 'cron';

@Injectable()
export class PollSchedulerService {
  constructor(
    @InjectRepository(MezonBotMessage)
    private mezonBotMessageRepository: Repository<MezonBotMessage>,
    private pollService: PollService,
  ) {
    this.startCronJobs();
  }

  startCronJobs(): void {
    const job = new CronJob(
      '* * * * *',
      () => {
        this.handleResultPollExpire();
      },
      null,
      true,
      'Asia/Ho_Chi_Minh',
    );

    job.start();
  }

  async handleResultPollExpire() {
    const now = Date.now();

    const expiredPolls = await this.mezonBotMessageRepository.find({
      where: {
        expireAt: LessThanOrEqual(now),
        deleted: false,
        pollResult: Not(IsNull()),
      },
    });

    if (!expiredPolls.length) return;

    expiredPolls.forEach((poll) => {
      this.pollService.handleResultPoll(poll);
    });
  }
}
