import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Director } from '../../directors/entities/director.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  genre: string;

  @Column({ type: 'int' })
  releaseYear: number;

  @Column({ type: 'simple-json', nullable: true })
  imageKeys: string[] | null;

  @ManyToOne(() => Director, (director) => director.films, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  director: Director;
}
