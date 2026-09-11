import { Column, Entity, PrimaryColumn } from 'typeorm';

// Kept independently of owners so cascading deletes cannot lose cleanup work.
@Entity('photo_cleanup')
export class PhotoCleanup {
  @PrimaryColumn({ length: 255 })
  key!: string;

  @Column({ default: false })
  objectDeleted!: boolean;
}
