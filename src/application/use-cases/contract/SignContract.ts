import { createHash } from 'crypto';
import { ContractRepository } from '../../../domain/repositories/ContractRepository';
import { Contract } from '../../../domain/entities/Contract';

interface SignContractRequest {
  contractId: string;
  signatureBase64: string;
  ipAddress: string;
}

export class SignContract {
  constructor(private contractRepository: ContractRepository) {}

  /**
   * Ejecuta el sellado criptográfico del contrato
   */
  async execute(request: SignContractRequest): Promise<Contract> {
    const contract = await this.contractRepository.getById(request.contractId);
    
    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status === 'signed') {
      throw new Error('Contract is already signed and sealed');
    }

    const timestamp = new Date().toISOString();
    
    // Generar el String a encriptar (Concatenación de valores críticos)
    // Cualquier mínimo cambio en la firma, contenido, hora o IP cambiará drásticamente el Hash.
    const payloadToHash = `${contract.content}|${request.signatureBase64}|${timestamp}|${request.ipAddress}`;
    
    // Calcular el Hash SHA-256
    const hashSignature = createHash('sha256').update(payloadToHash).digest('hex');

    // Actualizar el contrato con el estado firmado y la huella inmutable
    const updatedContract = await this.contractRepository.update(request.contractId, {
      status: 'signed',
      signedAt: new Date(timestamp),
      ipAddress: request.ipAddress,
      hashSignature: hashSignature
    });

    return updatedContract;
  }
}
