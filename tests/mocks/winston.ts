const winston = {
    createLogger: jest.fn(() => ({
        info: jest.fn(),
        error: jest.fn(),
    })),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        printf: jest.fn(),
        colorize: jest.fn(),
    },
    transports: {
        Console: jest.fn(),
        File: jest.fn(),
    },
};

export default winston;
