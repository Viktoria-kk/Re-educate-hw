import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';

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

  @OneToMany(() => Movie, (movie) => movie.director)
  films!: Movie[];
}
