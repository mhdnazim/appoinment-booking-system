/**
 * Below is a new class HttpError created extended from js default Error  class,
 * for creating new custom error instance by giving `message: String` and `statusCode: Number` as 
 * two different parameters to the constructor. There are also different helpful methods for 
 * specific errors which we use most frequently in our app. So refer through the methods below for 
 * easy and faster usage of this class.
 */
export class HttpError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }

    // Method to return custom error message
    public getError(): string {
        return `StatusCode: ${this.statusCode} \n Error: ${this.message}`;
    }

    // Static Method to throw not-found error
    public static notFound(): HttpError {
        return new HttpError('Resource not found', 404);
    }

    // Static Method to throw unauthorized error
    public static unauthorized(): HttpError {
        return new HttpError('Unauthorized access', 401);
    }

    // Static Method to throw internal server error
    public static internalServer(): HttpError {
        return new HttpError("Oops! Process failed, please do contact admin", 500);
    }

    // Static Method to throw invalid credential error
    public static invalidCredential(): HttpError {
        return new HttpError("Invalid credentials!", 400);
    }

    // Static Method to throw invalid input error 
    public static invalidInputs(): HttpError {
        return new HttpError("Invalid data inputs passed, Please check your data before retry!", 422);
    }

    // Static Method to throw db error
    public static dbError(): HttpError {
        return new HttpError("An error occurred!", 500);
    }

    // Static Method to throw valid custom errors
    public static createError(message: string, code: number): HttpError {
        return new HttpError(message, code);
    }

    // Static Method to throw bad request error
    public static badRequest(message: string = 'Bad Request'): HttpError {
        return new HttpError(message, 400);
    }

    // Static Method to throw forbidden error
    public static forbidden(message: string = 'Forbidden access'): HttpError {
        return new HttpError(message, 403);
    }

    // Static Method to throw conflict error
    public static conflict(message: string = 'Resource already exists'): HttpError {
        return new HttpError(message, 409);
    }

    // Static Method to throw unprocessable entity error
    public static unprocessableEntity(message: string = 'Unprocessable Entity'): HttpError {
        return new HttpError(message, 422);
    }

    // Static Method to throw too many requests error
    public static tooManyRequests(message: string = 'Too many requests, please try again later'): HttpError {
        return new HttpError(message, 429);
    }
}
