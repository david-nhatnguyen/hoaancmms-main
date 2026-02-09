import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class EquipmentsQrService {
  private readonly logger = new Logger(EquipmentsQrService.name);
  private readonly UPLOAD_DIR = path.join(process.cwd(), 'uploads/qrcodes/equipments');

  constructor(private readonly configService: ConfigService) {
    if (!fs.existsSync(this.UPLOAD_DIR)) {
      fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Generate QR code for equipment
   * @returns path to saved QR code
   */
  async generateQrCode(equipmentCode: string): Promise<string> {
    try {
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        this.configService.get<string>('CORS_ORIGIN') ||
        'http://localhost:5173';

      const detailUrl = `${frontendUrl}/equipments/detail/${equipmentCode}`;
      const fileName = `${equipmentCode}.png`;
      const filePath = path.join(this.UPLOAD_DIR, fileName);

      await QRCode.toFile(filePath, detailUrl, {
        errorCorrectionLevel: 'H',
        type: 'png',
        margin: 2,
        width: 400,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      this.logger.log(`Generated QR Code for equipment: ${equipmentCode}`);
      return `/uploads/qrcodes/equipments/${fileName}`;
    } catch (error) {
      this.logger.error(`Failed to generate QR Code for ${equipmentCode}: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete QR code file
   * @param equipmentCode
   */
  async deleteQrCode(equipmentCode: string): Promise<void> {
    try {
      const fileName = `${equipmentCode}.png`;
      const filePath = path.join(this.UPLOAD_DIR, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Deleted QR Code for equipment: ${equipmentCode}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete QR Code for ${equipmentCode}: ${error.message}`);
    }
  }
}
