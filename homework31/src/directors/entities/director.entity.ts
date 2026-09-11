import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';
import type { Photo } from '../../photos/photo';

@Entity('directors')
export class Director {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  nationality!: string;

  @Column()
  birthYear!: number;

  @Column({ type: 'simple-json', nullable: true })
  profilePhoto?: Photo | null;

  @OneToMany(() => Movie, (movie) => movie.director)
  films!: Movie[];
}
