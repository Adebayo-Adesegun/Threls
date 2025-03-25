import _ from 'lodash';

class SanitizerService {
    private toSnakeCase(obj: unknown): unknown {
        if (Array.isArray(obj)) {
            return obj.map((item) => this.toSnakeCase(item));
        }
        if (obj !== null && typeof obj === 'object') {
            const sanitizedObj = _.omit(obj, '__v');
            return _.mapKeys(sanitizedObj, (_value: unknown, key: string) =>
                _.snakeCase(key),
            );
        }
        return obj;
    }

    formatResponse(success: boolean, message: string, data: unknown = null) {
        return {
            success,
            message,
            data: this.toSnakeCase(data),
        };
    }
}

export default SanitizerService;
