import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { TABLE } from '../constants/tables';

export enum JackpotType {
  WIN = 'win',
  JACKPOT = 'jackPot',
  REGULAR = 'regular'
}

export enum SlotsType {
  K3 = '3k',
  K1 = '1k'
}

@Index(['id', 'user_id'])
@Entity(TABLE.JACKPOT_TRANSACTION)
export class JackPotTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'numeric', nullable: true, default: 0 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  user_id: string;

  @Column({ type: 'text', nullable: true })
  channel_id: string;

  @Column({ type: 'text', nullable: true })
  clan_id: string;

  @Column({ type: 'text', nullable: true })
  type: JackpotType;

  @Column({ type: 'text', nullable: true, default: null })
  typeSlots: SlotsType | null;
  
  @Column({ type: 'bigint', default: null })
  createAt: number;
}
