import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Movie } from '../../movies/entities/movie.entity';

@Entity('directors')
export class Director {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int' })
  birthYear: number;

  @Column()
  nationality: string;

  @Column({ type: 'varchar', nullable: true })
  profilePhotoKey: string | null;

  @OneToMany(() => Movie, (movie) => movie.director)
  films: Movie[];
}
