import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ select: false })
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 64, nullable: true, select: false })
  otpCodeHash: string | null;

  @Column({ type: 'datetime', nullable: true, select: false })
  otpExpiresAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  deactivatedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
