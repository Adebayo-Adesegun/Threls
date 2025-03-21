import { IsString, IsNumber, IsBoolean, IsIn, Min } from 'class-validator';
import { supportedCurrencies, billingCycle } from '../../config/constants';

export class default CreatePlanDto {
    @IsString()
    name: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsString()
    @IsIn(supportedCurrencies)
    currency: string;

    @IsString()
    @IsIn(billingCycle)
    billingCycle: string;

    @IsBoolean()
    isActive?: boolean; // Optional, defaults to `true`
}
