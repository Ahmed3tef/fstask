import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StoreEntity } from './store.entity';
import { CustomerEntity } from './customer.entity';
import { OrderStatus } from './order-status.enum';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  store_id: number;

  @Column({ type: 'int' })
  customer_id: number;

  @Column({ type: 'text', default: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus;

  @Column({ type: 'int' })
  amount_cents: number;

  @Column({ type: 'datetime' })
  created_at: Date;

  @Column({ type: 'datetime' })
  updated_at: Date;

  // Relations for eager loading customer and store data
  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @ManyToOne(() => StoreEntity)
  @JoinColumn({ name: 'store_id' })
  store: StoreEntity;
}
