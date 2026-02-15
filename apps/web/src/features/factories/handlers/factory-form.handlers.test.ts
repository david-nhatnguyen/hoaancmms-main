
import { validateFactoryForm, sanitizeFactoryData } from './factory-form.handlers';

describe('Factory Form Handlers', () => {
    describe('validateFactoryForm', () => {
        it('should return empty errors for valid data', () => {
            const data = {
                code: 'F01',
                name: 'Factory 01',
                location: 'Hanoi',
                status: 'ACTIVE' as const
            };
            const errors = validateFactoryForm(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should return errors for missing code', () => {
            const data = {
                code: '',
                name: 'Factory 01',
                location: 'Hanoi',
                status: 'ACTIVE' as const
            };
            const errors = validateFactoryForm(data);
            expect(errors.code).toBeDefined();
        });

        it('should return errors for missing name', () => {
            const data = {
                code: 'F01',
                name: '',
                location: 'Hanoi',
                status: 'ACTIVE' as const
            };
            const errors = validateFactoryForm(data);
            expect(errors.name).toBeDefined();
        });
    });

    describe('sanitizeFactoryData', () => {
        it('should trim and uppercase code', () => {
            const data = {
                code: ' f01 ',
                name: ' Factory Name ',
                location: ' Location ',
                status: 'ACTIVE' as const
            };
            const cleaned = sanitizeFactoryData(data);
            expect(cleaned.code).toBe('F01');
            expect(cleaned.name).toBe('Factory Name');
            expect(cleaned.location).toBe('Location');
        });
    });
});
