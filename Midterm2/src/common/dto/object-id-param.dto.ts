import { IsMongoId } from 'class-validator';

export class ObjectIdParamDto {
  @IsMongoId()
  id!: string;
}
