import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'stores' })
export class StoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int', default: 0 })
  balance_cents: number;
}
