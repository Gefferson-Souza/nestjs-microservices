import { BadRequestException } from '@nestjs/common';
import { ValidationParametersPipe } from './validation-parameters.pipe';

describe('ValidationParametersPipe', () => {
  let pipe: ValidationParametersPipe;

  beforeEach(() => {
    pipe = new ValidationParametersPipe();
  });

  it('should be defined', () => {
    expect(new ValidationParametersPipe()).toBeDefined();
  });

  it('should return the value if it is valid', () => {
    // Arrange
    const value = 'teste';
    const metadata = { type: 'param', data: 'id', metatype: String };

    // Act
    const result = pipe.transform(value, metadata);

    // Assert
    expect(result).toBe(value);
  });

  it('should throw BadRequestException if value is null', () => {
    // Arrange
    const value = null;
    const metadata = { type: 'param', data: 'id', metatype: String };

    // Act & Assert
    expect(() => pipe.transform(value, metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform(value, metadata)).toThrow(`The value of the parameter id is required`);
  });

  it('should throw BadRequestException if value is undefined', () => {
    // Arrange
    const value = undefined;
    const metadata = { type: 'param', data: 'playerId', metatype: String };

    // Act & Assert
    expect(() => pipe.transform(value, metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform(value, metadata)).toThrow(`The value of the parameter playerId is required`);
  });

  it('should throw BadRequestException if value is empty string', () => {
    // Arrange
    const value = '';
    const metadata = { type: 'param', data: 'categoryId', metatype: String };

    // Act & Assert
    expect(() => pipe.transform(value, metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform(value, metadata)).toThrow(`The value of the parameter categoryId is required`);
  });

  it('should accept number values greater than 0', () => {
    // Arrange
    const value = 123;
    const metadata = { type: 'param', data: 'id', metatype: Number };

    // Act
    const result = pipe.transform(value, metadata);

    // Assert
    expect(result).toBe(value);
  });

  it('should accept boolean values', () => {
    // Arrange
    const value = true;
    const metadata = { type: 'param', data: 'isActive', metatype: Boolean };

    // Act
    const result = pipe.transform(value, metadata);

    // Assert
    expect(result).toBe(value);
  });
});
