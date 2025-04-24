import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PlayersValidationParametersPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    
    if(!value) {
      throw new BadRequestException(`The value of the parameter ${metadata.data} is required`);
    }

    return value;
  }
}
