import { asClass, createContainer } from 'awilix';
import SanitizerService from '../../src/services/sanitizer.service';

describe('SanitizerService', () => {
    let sanitizerService: SanitizerService;

    beforeEach(() => {
        const container = createContainer();
        container.register({
            sanitizerService: asClass(SanitizerService).singleton(),
        });

        sanitizerService =
            container.resolve<SanitizerService>('sanitizerService');
    });

    describe('formatResponse', () => {
        it('should return a formatted response with snake_case keys', () => {
            const data = { firstName: 'John', lastName: 'Doe', age: 30 };
            const response = sanitizerService.formatResponse(
                true,
                'Success',
                data,
            );

            expect(response).toEqual({
                success: true,
                message: 'Success',
                data: {
                    first_name: 'John',
                    last_name: 'Doe',
                    age: 30,
                },
            });
        });

        it('should omit the "__v" field from the response', () => {
            const data = { name: 'Test', __v: 2 };
            const response = sanitizerService.formatResponse(
                true,
                'Success',
                data,
            );

            expect(response.data).toEqual({
                name: 'Test',
            });
        });

        it('should handle arrays correctly', () => {
            const data = [
                { firstName: 'John', lastName: 'Doe' },
                { firstName: 'Jane', lastName: 'Doe' },
            ];
            const response = sanitizerService.formatResponse(
                true,
                'Success',
                data,
            );

            expect(response.data).toEqual([
                { first_name: 'John', last_name: 'Doe' },
                { first_name: 'Jane', last_name: 'Doe' },
            ]);
        });

        it('should return null for data when not provided', () => {
            const response = sanitizerService.formatResponse(true, 'Success');

            expect(response).toEqual({
                success: true,
                message: 'Success',
                data: null,
            });
        });

        it('should return primitive values unchanged', () => {
            const response = sanitizerService.formatResponse(
                true,
                'Success',
                42,
            );

            expect(response).toEqual({
                success: true,
                message: 'Success',
                data: 42,
            });
        });
    });
});
