import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Director } from '../../directors/entities/director.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  genre!: string;

  @Column()
  year!: number;

  @Column({ type: 'text' })
  description!: string;

  @ManyToOne(() => Director, (director) => director.films, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  director!: Director;
}
