import { Test, TestingModule } from '@nestjs/testing';
import { DigitalProductController } from './digital-product.controller';
import { DigitalProductService } from './digital-product.service';

describe('DigitalProductController', () => {
  let controller: DigitalProductController;

  const mockService = {
    setDigitalFile: jest.fn(),
    generateDownloadTokens: jest.fn(),
    downloadByToken: jest.fn(),
    getOrderDownloads: jest.fn(),
    getCustomerDownloads: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DigitalProductController],
      providers: [{ provide: DigitalProductService, useValue: mockService }],
    }).compile();

    controller = module.get<DigitalProductController>(DigitalProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('setDigitalFile should call service', async () => {
    mockService.setDigitalFile.mockResolvedValue({ id: 'v1' });
    await controller.setDigitalFile('v1', { fileUrl: 'url' });
    expect(mockService.setDigitalFile).toHaveBeenCalledWith('v1', {
      fileUrl: 'url',
    });
  });

  it('generateTokens should call service', async () => {
    mockService.generateDownloadTokens.mockResolvedValue([{ token: 't1' }]);
    await controller.generateTokens('o1');
    expect(mockService.generateDownloadTokens).toHaveBeenCalledWith('o1');
  });

  it('download should call service', async () => {
    mockService.downloadByToken.mockResolvedValue({ fileUrl: 'url' });
    await controller.download('tok123');
    expect(mockService.downloadByToken).toHaveBeenCalledWith('tok123');
  });

  it('getOrderDownloads should call service', async () => {
    mockService.getOrderDownloads.mockResolvedValue([]);
    await controller.getOrderDownloads('o1');
    expect(mockService.getOrderDownloads).toHaveBeenCalledWith('o1');
  });

  it('getCustomerDownloads should call service', async () => {
    mockService.getCustomerDownloads.mockResolvedValue([]);
    await controller.getCustomerDownloads('01700000000');
    expect(mockService.getCustomerDownloads).toHaveBeenCalledWith(
      '01700000000',
    );
  });
});
