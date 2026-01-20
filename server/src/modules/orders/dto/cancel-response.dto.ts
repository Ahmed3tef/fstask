import { OrderResponseDto } from './order-response.dto';

export class CancelOrderResponseDto {
  success: boolean;
  message: string;
  order: OrderResponseDto;
}
