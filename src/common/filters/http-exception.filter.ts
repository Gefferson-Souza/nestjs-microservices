import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly _logger = new Logger(AllExceptionsFilter.name);
    
    catch(
        exception: unknown,
        host: ArgumentsHost,
    ){
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();

        const status = exception instanceof HttpException 
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = exception instanceof HttpException
            ? exception.getResponse()
            :  exception;

        this._logger.error(`HTTP Status: ${status} Error Message: ${JSON.stringify(message)}`);

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            error: message,
        });
    }
}