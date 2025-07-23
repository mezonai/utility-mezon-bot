import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TABLE } from '../constants/tables';

export interface PollResult {
  username: string;
  emoji: string;
}

export interface LixiDetail {
  user_id?: string;
  username: string;
  amount: number;
}

@Index(['messageId', 'channelId', 'userId'])
// @Index(['messageId', 'channelId', 'deleted'])
@Entity(TABLE.MEZON_BOT_MESSAGE)
export class MezonBotMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  messageId: string;

  @Column({ type: 'text', nullable: true })
  userId: string;

  @Column({ type: 'text', nullable: true })
  channelId: string;

  @Column({ type: 'text', nullable: true, default: null })
  content: string;

  @Column('text', { array: true, nullable: true, default: null })
  pollResult: string[];

  @Column({ nullable: true, default: false })
  deleted: boolean;

  @Column({ type: 'decimal', default: null })
  createAt: number;

  @Column({ type: 'decimal', default: null })
  expireAt: number;

  @Column('text', { array: true, nullable: true, default: null })
  roleResult: string[];

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
  lixiResult: [number[], number, LixiDetail[], string];
}
