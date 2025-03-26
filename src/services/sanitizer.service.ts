import _ from 'lodash';
import mongoose from 'mongoose';

class SanitizerService {
    private toSnakeCase(obj: unknown): unknown {
        if (Array.isArray(obj)) {
            return obj.map((item) => this.toSnakeCase(item));
        }
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (
            typeof obj === 'boolean' ||
            typeof obj === 'number' ||
            typeof obj === 'string'
        ) {
            return obj;
        }
        if (mongoose.isValidObjectId(obj)) {
            return obj.toString();
        }
        if (obj instanceof Date) {
            return obj.toISOString();
        }
        if (Buffer.isBuffer(obj)) {
            return obj.toString('base64');
        }
        if (obj instanceof Map) {
            return Object.fromEntries(obj.entries());
        }
        if (obj instanceof Set) {
            return Array.from(obj);
        }
        if (typeof obj === 'object') {
            const sanitizedObj = _.omit(obj, '__v');
            return _.mapValues(
                _.mapKeys(sanitizedObj, (_value, key) => _.snakeCase(key)),
                (value) => this.toSnakeCase(value),
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
