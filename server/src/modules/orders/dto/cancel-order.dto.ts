import { IsBoolean } from 'class-validator';
export class CancelOrderDto {
  @IsBoolean({ message: 'refund must be a boolean value' })
  refund: boolean;
}
