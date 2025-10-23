import { ChannelMessage, EMarkdownType } from 'mezon-sdk';
import { Command } from 'src/bot/base/commandRegister.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommandMessage } from 'src/bot/base/command.abstract';
import { MezonClientService } from 'src/mezon/services/mezon-client.service';
import { Transaction } from 'src/bot/models/transaction.entity';
import { User } from 'src/bot/models/user.entity';
import { EUserError } from 'src/bot/constants/error';

@Command('chk')
export class ChecktransactionCommand extends CommandMessage {
  private queue: ChannelMessage[] = [];
  private running = false;
  constructor(
    clientService: MezonClientService,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super(clientService);
    this.startWorker();
  }

  private async startWorker() {
    if (this.running) return;
    this.running = true;
    setInterval(async () => {
      if (this.queue.length === 0) return;
      const msg = this.queue.shift();
      if (msg) await this.processCheckTransaction(msg);
    }, 100);
  }

  async getTotalAmountUser() {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select(
        `
      COALESCE(
        SUM(CASE WHEN CAST(user.amount AS numeric) > 0 THEN CAST(user.amount AS numeric) ELSE 0 END),
      0)
    `,
        'total_amount',
      )
      .getRawOne();

    const dirtyUsers = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.user_id AS user_id', 'user.amount AS amount'])
      .where(`(user.amount)::text !~ '^[-+]?[0-9]+(\\.[0-9]+)?$'`)
      .getRawMany();

    const totalAmount = parseFloat(result?.total_amount ?? '0') || 0;
    return { result, totalAmount, dirtyUsers };
  }

  async execute(args: string[], message: ChannelMessage) {
    (message as any).args = args;
    if (args[0] === 'admin') {
      if (message.sender_id !== '1827994776956309504') return;
      const messageChannel = await this.getChannelMessage(message);
      const { result, totalAmount, dirtyUsers } =
        await this.getTotalAmountUser();
      const findBot = await this.userRepository.findOne({
        where: { user_id: process.env.UTILITY_BOT_ID },
      });

      const botAmount = Number(findBot?.amount ?? 0);
      const total = Number(totalAmount) - botAmount;

      if (!findBot) return;
      const totalPot =
        +findBot?.jackPot + +findBot?.jackPot1k + +findBot?.jackPot3k;
      await messageChannel?.reply({
        t: `${JSON.stringify(result)}\n ${JSON.stringify(dirtyUsers)} \nTổng tiền user: ${total.toLocaleString('vi-VN')}, Tiền POT: ${totalPot.toLocaleString('vi-VN')}\nTiền user + pot: ${(total + totalPot).toLocaleString('vi-VN')}\nTiền bot: ${(+findBot?.amount).toLocaleString('vi-VN')}`,
      });
      return;
    }
    this.queue.push(message);
  }

  async processCheckTransaction(message: ChannelMessage) {
    const args = (message as any).args;
    const messageChannel = await this.getChannelMessage(message);

    if (message.username === 'Anonymous' || !args[0]) {
      const content = !args[0]
        ? 'Thiếu transactionId!'
        : `[chk] Anonymous can't use this command!`;

      return await messageChannel?.reply({
        t: content,
        mk: [
          {
            type: EMarkdownType.PRE,
            s: 0,
            e: content.length,
          },
        ],
      });
    }
    const findTransaction = await this.transactionRepository.findOne({
      where: { transactionId: args[0] },
    });
    if (!findTransaction) {
      const channel = await this.client.channels.fetch(message.channel_id);
      const user = await channel.clan.users.fetch(message.sender_id);
      let transaction;
      try {
        transaction = await user.listTransactionDetail(args[0]);
      } catch (error) {
        const content = `Lỗi khi check transaction!`;

        return await messageChannel?.reply({
          t: content,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: content.length,
            },
          ],
        });
      }
      const cutoffDate = new Date('2025-06-06T00:00:00.000Z'); // sau ngày 07/06/2025 thì return
      const createdAt = new Date(transaction?.create_time);
      if (!transaction || createdAt < cutoffDate) {
        const content = `[Transaction] transaction không tồn tại hoặc quá ngày kiểm tra`;
        return await messageChannel?.reply({
          t: content,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: content.length,
            },
          ],
        });
      }
      if (
        transaction.sender_id === message.sender_id &&
        transaction.receiver_id === process.env.UTILITY_BOT_ID
      ) {
        const trans = {
          transactionId: transaction.trans_id,
          sender_id: transaction.sender_id,
          receiver_id: transaction.receiver_id,
          amount: transaction.amount,
          note: transaction.metadata,
          createAt: new Date(transaction.create_time).getTime(),
        };
        await this.transactionRepository.insert(trans);
        const users = await this.userRepository.find({
          where: [
            { user_id: message.sender_id },
            { user_id: process.env.UTILITY_BOT_ID },
          ],
        });
        const findUser = users.find(
          (user) => user.user_id === message.sender_id,
        );

        const botInfo = users.find(
          (user) => user.user_id === process.env.UTILITY_BOT_ID,
        );

        if (!findUser || !botInfo) {
          return await messageChannel?.reply({
            t: EUserError.INVALID_USER,
            mk: [
              {
                type: EMarkdownType.PRE,
                s: 0,
                e: EUserError.INVALID_USER.length,
              },
            ],
          });
        }
        const newUserAmount =
          Number(findUser.amount) + Number(transaction.amount);
        const newBotAmount =
          Number(botInfo.amount) + Number(transaction.amount);
        await Promise.all([
          this.userRepository.update(
            { user_id: message.sender_id },
            { amount: newUserAmount },
          ),
          this.userRepository.update(
            { user_id: process.env.UTILITY_BOT_ID },
            { amount: newBotAmount },
          ),
        ]);

        const content = `[Transaction] Đã cập nhật lại token`;
        return await messageChannel?.reply({
          t: content,
          mk: [
            {
              type: EMarkdownType.PRE,
              s: 0,
              e: content.length,
            },
          ],
        });
      }

      const content = `[Transaction] transaction không hợp lệ`;
      return await messageChannel?.reply({
        t: content,
        mk: [
          {
            type: EMarkdownType.PRE,
            s: 0,
            e: content.length,
          },
        ],
      });
    }

    const content = `[Transaction] transaction này đã tồn tại`;
    return await messageChannel?.reply({
      t: content,
      mk: [
        {
          type: EMarkdownType.PRE,
          s: 0,
          e: content.length,
        },
      ],
    });
  }
  return;
}
