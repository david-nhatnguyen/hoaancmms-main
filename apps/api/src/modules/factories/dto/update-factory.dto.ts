import { PartialType } from '@nestjs/swagger';
import { CreateFactoryDto } from './create-factory.dto';

/**
 * Update Factory DTO
 * 
 * Why use PartialType?
 * - Makes all fields optional
 * - Allows partial updates (only send changed fields)
 * - Inherits all validation from CreateFactoryDto
 * - DRY principle (Don't Repeat Yourself)
 * 
 * Example usage:
 * PATCH /api/factories/:id
 * Body: { "name": "New Name" }  // Only update name
 * Body: { "status": "INACTIVE" }  // Only update status
 * Body: { "name": "New Name", "location": "New Location" }  // Update multiple
 * 
 * All validations still apply:
 * - If code is sent, must match /^F\d+$/
 * - If status is sent, must be valid enum
 */
export class UpdateFactoryDto extends PartialType(CreateFactoryDto) { }
